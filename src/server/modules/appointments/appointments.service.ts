import "server-only";

import { generateManageToken } from "@/lib/booking/manage-token";
import { normalizePhoneToE164 } from "@/lib/phone/normalize-e164";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  MoveAppointmentInput,
  UpdateAppointmentStatusInput,
  WalkInAppointmentInput,
} from "@/lib/validations/appointment";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";
import {
  requireSelfOrOwner,
  requireShopMember,
  ShopAccessError,
} from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";
import { auditDiff, writeAuditLog } from "@/server/modules/audit/write-audit-log";
import { fetchAvailabilityForShop } from "@/server/modules/booking/availability-io.service";
import {
  getServiceForShop,
  getShopSchedulingContextBySlug,
} from "@/server/modules/booking/booking.queries";
import { createServiceRoleClient } from "@/lib/supabase/service";

import {
  validateAppointmentStatusTransition,
  type AppointmentStatus,
} from "./appointment-status";

export type AppointmentServiceResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code:
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "VALIDATION"
        | "SLOT_TAKEN"
        | "INVALID_TRANSITION"
        | "TOO_EARLY"
        | "UNKNOWN";
    };

function mapAccessError(error: unknown): AppointmentServiceResult<never> {
  if (error instanceof ShopAccessError) {
    return { ok: false, code: "FORBIDDEN" };
  }
  return { ok: false, code: "UNKNOWN" };
}

function slotIsAvailable(
  slots: Array<{ membershipId: string; startsAt: string }>,
  membershipId: string,
  startsAt: string,
): boolean {
  const targetMs = new Date(startsAt).getTime();
  return slots.some(
    (slot) =>
      slot.membershipId === membershipId &&
      new Date(slot.startsAt).getTime() === targetMs,
  );
}

export async function createWalkInAppointment(
  actor: Actor,
  shopId: string,
  input: WalkInAppointmentInput,
): Promise<AppointmentServiceResult<{ id: string }>> {
  let membership;
  try {
    membership = requireSelfOrOwner(actor, shopId, input.membershipId);
  } catch (error) {
    return mapAccessError(error);
  }

  if (membership.role === "barber" && membership.id !== input.membershipId) {
    return { ok: false, code: "FORBIDDEN" };
  }

  const admin = createServiceRoleClient();
  const { data: shopRow, error: shopError } = await admin
    .from("shops")
    .select("slug, status")
    .eq("id", shopId)
    .maybeSingle();

  if (shopError || !shopRow) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (shopRow.status !== "active") {
    return { ok: false, code: "VALIDATION" };
  }

  const service = await getServiceForShop(admin, shopId, input.serviceId);
  if (!service) {
    return { ok: false, code: "VALIDATION" };
  }

  const shopContext = await getShopSchedulingContextBySlug(admin, shopRow.slug);
  if (!shopContext) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const date = dateInShopTimezone(new Date(input.startsAt), shopContext.timezone);
  const availability = await fetchAvailabilityForShop({
    slug: shopRow.slug,
    serviceId: input.serviceId,
    date,
    membershipId: input.membershipId,
  });

  if (!availability.ok) {
    return { ok: false, code: "VALIDATION" };
  }

  if (!slotIsAvailable(availability.slots, input.membershipId, input.startsAt)) {
    return { ok: false, code: "SLOT_TAKEN" };
  }

  const { data: serviceRow, error: serviceError } = await admin
    .from("services")
    .select("name, price_cents, duration_min")
    .eq("shop_id", shopId)
    .eq("id", input.serviceId)
    .maybeSingle();

  if (serviceError || !serviceRow) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const endsAt = new Date(
    new Date(input.startsAt).getTime() + serviceRow.duration_min * 60_000,
  ).toISOString();

  let customerId: string | null = null;
  if (input.name && input.phone) {
    const phone = normalizePhoneToE164(input.phone);
    if (!phone) {
      return { ok: false, code: "VALIDATION" };
    }

    const { data: customer, error: customerError } = await admin
      .from("customers")
      .upsert(
        {
          shop_id: shopId,
          name: input.name,
          phone,
        },
        { onConflict: "shop_id,phone" },
      )
      .select("id")
      .single();

    if (customerError || !customer) {
      return { ok: false, code: "UNKNOWN" };
    }
    customerId = customer.id;
  }

  const manageToken = generateManageToken();
  const supabase = await createServerSupabaseClient();

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      shop_id: shopId,
      customer_id: customerId,
      membership_id: input.membershipId,
      service_id: input.serviceId,
      starts_at: input.startsAt,
      ends_at: endsAt,
      status: "booked",
      service_name: serviceRow.name,
      price_cents: serviceRow.price_cents,
      source: "walk_in",
      manage_token: manageToken,
    })
    .select("id")
    .single();

  if (insertError || !appointment) {
    if (insertError?.code === "23P01") {
      return { ok: false, code: "SLOT_TAKEN" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "appointment.walk_in",
    entity: "appointment",
    entity_id: appointment.id,
    diff: auditDiff({}, { source: "walk_in", membership_id: input.membershipId }),
  });

  return { ok: true, data: { id: appointment.id } };
}

export async function updateAppointmentStatus(
  actor: Actor,
  shopId: string,
  input: UpdateAppointmentStatusInput,
): Promise<AppointmentServiceResult<{ id: string; status: AppointmentStatus }>> {
  try {
    requireShopMember(actor, shopId);
  } catch (error) {
    return mapAccessError(error);
  }

  const supabase = await createServerSupabaseClient();
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, shop_id, membership_id, status, starts_at")
    .eq("shop_id", shopId)
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (error || !appointment) {
    return { ok: false, code: "NOT_FOUND" };
  }

  try {
    requireSelfOrOwner(actor, shopId, appointment.membership_id);
  } catch (accessError) {
    return mapAccessError(accessError);
  }

  const transition = validateAppointmentStatusTransition(
    appointment.status,
    input.status,
    new Date(appointment.starts_at),
    new Date(),
  );

  if (!transition.ok) {
    return { ok: false, code: transition.code };
  }

  const patch: {
    status: AppointmentStatus;
    cancelled_at?: string | null;
  } = { status: input.status };

  if (input.status === "cancelled") {
    patch.cancelled_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await supabase
    .from("appointments")
    .update(patch)
    .eq("shop_id", shopId)
    .eq("id", input.appointmentId)
    .select("id, status")
    .single();

  if (updateError || !updated) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: `appointment.${input.status}`,
    entity: "appointment",
    entity_id: updated.id,
    diff: auditDiff({ status: appointment.status }, { status: updated.status }),
  });

  return { ok: true, data: updated };
}

export async function moveAppointment(
  actor: Actor,
  shopId: string,
  input: MoveAppointmentInput,
): Promise<AppointmentServiceResult<{ id: string; startsAt: string; endsAt: string }>> {
  try {
    requireShopMember(actor, shopId);
  } catch (error) {
    return mapAccessError(error);
  }

  const supabase = await createServerSupabaseClient();
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, shop_id, membership_id, service_id, status, starts_at")
    .eq("shop_id", shopId)
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (error || !appointment) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (appointment.status !== "booked") {
    return { ok: false, code: "VALIDATION" };
  }

  const targetMembershipId = input.membershipId ?? appointment.membership_id;

  try {
    requireSelfOrOwner(actor, shopId, appointment.membership_id);
    if (targetMembershipId !== appointment.membership_id) {
      requireSelfOrOwner(actor, shopId, targetMembershipId);
    }
  } catch (accessError) {
    return mapAccessError(accessError);
  }

  const admin = createServiceRoleClient();
  const { data: shopRow } = await admin
    .from("shops")
    .select("slug, status")
    .eq("id", shopId)
    .maybeSingle();

  if (!shopRow || shopRow.status !== "active") {
    return { ok: false, code: "VALIDATION" };
  }

  const service = await getServiceForShop(admin, shopId, appointment.service_id);
  if (!service) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const shopContext = await getShopSchedulingContextBySlug(admin, shopRow.slug);
  if (!shopContext) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const date = dateInShopTimezone(new Date(input.startsAt), shopContext.timezone);
  const availability = await fetchAvailabilityForShop({
    slug: shopRow.slug,
    serviceId: appointment.service_id,
    date,
    membershipId: targetMembershipId,
  });

  if (!availability.ok) {
    return { ok: false, code: "VALIDATION" };
  }

  if (!slotIsAvailable(availability.slots, targetMembershipId, input.startsAt)) {
    return { ok: false, code: "SLOT_TAKEN" };
  }

  const endsAt = new Date(
    new Date(input.startsAt).getTime() + service.durationMin * 60_000,
  ).toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("appointments")
    .update({
      starts_at: input.startsAt,
      ends_at: endsAt,
      membership_id: targetMembershipId,
    })
    .eq("shop_id", shopId)
    .eq("id", input.appointmentId)
    .select("id, starts_at, ends_at")
    .single();

  if (updateError || !updated) {
    if (updateError?.code === "23P01") {
      return { ok: false, code: "SLOT_TAKEN" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "appointment.moved",
    entity: "appointment",
    entity_id: updated.id,
    diff: auditDiff(
      { starts_at: appointment.starts_at, membership_id: appointment.membership_id },
      { starts_at: updated.starts_at, membership_id: targetMembershipId },
    ),
  });

  return {
    ok: true,
    data: { id: updated.id, startsAt: updated.starts_at, endsAt: updated.ends_at },
  };
}
