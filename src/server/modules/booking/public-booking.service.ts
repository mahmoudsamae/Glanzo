import "server-only";

import type { PublicApiAlternativeSlot } from "@/lib/api/public-response";
import { mapBookingRpcError } from "@/lib/booking/errors";
import { normalizePhoneToE164 } from "@/lib/phone/normalize-e164";
import { createAnonServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { CreateBookingBody } from "@/lib/validations/booking";
import { pickNearestAlternativeSlots } from "@/server/modules/booking/alternative-slots";
import type {
  BookAppointmentRpcResult,
  CancelBookingByTokenRpcResult,
  GetBookingByTokenRpcResult,
  RescheduleBookingByTokenRpcResult,
} from "@/types/database-rpc.types";

import { getAppointmentSchedulingContextByToken } from "./booking.queries";
import {
  fetchAvailabilityNearSlot,
  slotsToAvailabilityModels,
} from "./availability-io.service";

export type PublicBookingResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ReturnType<typeof mapBookingRpcError>; alternatives?: PublicApiAlternativeSlot[] };

export type BookedAppointmentDto = {
  id: string;
  shopId: string;
  startsAt: string;
  endsAt: string;
  manageUrl: string;
  idempotentReplay: boolean;
};

function manageUrlFromToken(token: string): string {
  return `/bookings/${token}`;
}

function mapRpcFailure(
  message: string,
  alternatives?: PublicApiAlternativeSlot[],
): PublicBookingResult<never> {
  return {
    ok: false,
    code: mapBookingRpcError(message),
    alternatives,
  };
}

async function alternativesForSlotTaken(input: {
  slug: string;
  serviceId: string;
  membershipId: string | null | undefined;
  requestedStartsAt: string;
}): Promise<PublicApiAlternativeSlot[]> {
  const slots = await fetchAvailabilityNearSlot({
    slug: input.slug,
    serviceId: input.serviceId,
    membershipId: input.membershipId,
    requestedStartsAt: new Date(input.requestedStartsAt),
  });

  const nearest = pickNearestAlternativeSlots(
    slotsToAvailabilityModels(slots),
    new Date(input.requestedStartsAt),
    3,
  );

  return nearest.map((slot) => ({
    membershipId: slot.membershipId,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
  }));
}

export async function bookPublicAppointment(input: {
  slug: string;
  body: CreateBookingBody;
  idempotencyKey: string;
  clientIp: string | null;
}): Promise<PublicBookingResult<BookedAppointmentDto>> {
  const phone = normalizePhoneToE164(input.body.phone);
  if (!phone) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const supabase = createAnonServerClient();
  const { data, error } = await supabase.rpc("book_appointment", {
    p_shop_slug: input.slug,
    p_service_id: input.body.serviceId,
    p_membership_id: input.body.membershipId ?? null,
    p_starts_at: input.body.startsAt,
    p_name: input.body.name,
    p_phone: phone,
    p_email: input.body.email ?? null,
    p_idempotency_key: input.idempotencyKey,
    p_client_ip: input.clientIp,
  });

  if (error) {
    const code = mapBookingRpcError(error.message);
    if (code === "SLOT_TAKEN") {
      const alternatives = await alternativesForSlotTaken({
        slug: input.slug,
        serviceId: input.body.serviceId,
        membershipId: input.body.membershipId,
        requestedStartsAt: input.body.startsAt,
      });
      return mapRpcFailure(error.message, alternatives);
    }
    return mapRpcFailure(error.message);
  }

  const row = data as BookAppointmentRpcResult;
  return {
    ok: true,
    data: {
      id: row.id,
      shopId: row.shop_id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      manageUrl: manageUrlFromToken(row.manage_token),
      idempotentReplay: row.idempotent_replay,
    },
  };
}

export async function getPublicBooking(
  token: string,
): Promise<PublicBookingResult<GetBookingByTokenRpcResult>> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase.rpc("get_booking_by_token", { p_token: token });

  if (error) {
    return mapRpcFailure(error.message);
  }

  return { ok: true, data: data as GetBookingByTokenRpcResult };
}

export async function cancelPublicBooking(
  token: string,
): Promise<PublicBookingResult<CancelBookingByTokenRpcResult>> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase.rpc("cancel_booking_by_token", { p_token: token });

  if (error) {
    return mapRpcFailure(error.message);
  }

  return { ok: true, data: data as CancelBookingByTokenRpcResult };
}

export async function reschedulePublicBooking(input: {
  token: string;
  startsAt: string;
}): Promise<PublicBookingResult<RescheduleBookingByTokenRpcResult & { manageUrl: string }>> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase.rpc("reschedule_booking_by_token", {
    p_token: input.token,
    p_new_starts_at: input.startsAt,
  });

  if (error) {
    const code = mapBookingRpcError(error.message);
    if (code === "SLOT_TAKEN") {
      const admin = createServiceRoleClient();
      const context = await getAppointmentSchedulingContextByToken(admin, input.token);
      const alternatives = context
        ? await alternativesForSlotTaken({
            slug: context.shopSlug,
            serviceId: context.serviceId,
            membershipId: context.membershipId,
            requestedStartsAt: input.startsAt,
          })
        : [];
      return mapRpcFailure(error.message, alternatives);
    }
    return mapRpcFailure(error.message);
  }

  const row = data as RescheduleBookingByTokenRpcResult;
  return {
    ok: true,
    data: {
      ...row,
      manageUrl: manageUrlFromToken(row.manage_token),
    },
  };
}
