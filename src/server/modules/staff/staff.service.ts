import "server-only";

import { randomBytes } from "node:crypto";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidateShopPublic } from "@/lib/minisite/revalidate-shop-public";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  createStaffInviteInputSchema,
  staffDayHoursSchema,
  timeOffInputSchema,
  type StaffDayHours,
  type TimeOffInput,
} from "@/lib/validations/staff";
import { auditDiff, writeAuditLog } from "@/server/modules/audit/write-audit-log";
import {
  requireSelfOrOwner,
  requireShopMember,
  requireShopOwner,
} from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

import {
  getInviteByToken,
  listPendingInvites,
  listShopMemberships,
  listStaffHours,
  listTimeOff,
} from "./staff.queries";

export type StaffResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string };

function inviteToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getStaffPageData(actor: Actor, shopId: string) {
  const membership = requireShopMember(actor, shopId);
  const supabase = await createServerSupabaseClient();

  if (membership.role === "owner") {
    const [members, invites] = await Promise.all([
      listShopMemberships(supabase, shopId),
      listPendingInvites(supabase, shopId),
    ]);
    return { ok: true as const, data: { role: "owner" as const, members, invites } };
  }

  const [hours, timeOff] = await Promise.all([
    listStaffHours(supabase, shopId, membership.id),
    listTimeOff(supabase, shopId, membership.id),
  ]);

  return {
    ok: true as const,
    data: { role: "barber" as const, membershipId: membership.id, hours, timeOff },
  };
}

export async function createStaffInvite(
  actor: Actor,
  shopId: string,
  input: { email: string },
): Promise<StaffResult<{ token: string; id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = createStaffInviteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const token = inviteToken();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("staff_invites")
    .insert({
      shop_id: shopId,
      email: parsed.data.email,
      role: "barber",
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: actor.userId,
    })
    .select("id, email, token")
    .single();

  if (error || !data) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "invite.created",
    entity: "staff_invite",
    entity_id: data.id,
    diff: auditDiff({}, { email: data.email }),
  });

  return { ok: true, data: { token: data.token, id: data.id } };
}

export async function revokeStaffInvite(
  actor: Actor,
  shopId: string,
  inviteId: string,
): Promise<StaffResult<{ id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("staff_invites")
    .delete()
    .eq("shop_id", shopId)
    .eq("id", inviteId)
    .is("accepted_at", null);

  if (error) {
    return { ok: false, code: "UNKNOWN" };
  }

  await writeAuditLog({
    shop_id: shopId,
    actor_id: actor.userId,
    actor_type: "user",
    action: "invite.revoked",
    entity: "staff_invite",
    entity_id: inviteId,
    diff: null,
  });

  return { ok: true, data: { id: inviteId } };
}

export async function replaceStaffHours(
  actor: Actor,
  shopId: string,
  membershipId: string,
  days: StaffDayHours[],
): Promise<StaffResult<{ membershipId: string }>> {
  try {
    requireSelfOrOwner(actor, shopId, membershipId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  for (const day of days) {
    const parsed = staffDayHoursSchema.safeParse(day);
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION" };
    }
  }

  const supabase = await createServerSupabaseClient();
  const { error: deleteError } = await supabase
    .from("staff_hours")
    .delete()
    .eq("shop_id", shopId)
    .eq("membership_id", membershipId);

  if (deleteError) {
    return { ok: false, code: "UNKNOWN" };
  }

  const rows = days.flatMap((day) =>
    day.shifts.map((shift) => ({
      shop_id: shopId,
      membership_id: membershipId,
      weekday: day.weekday,
      start_time: shift.startTime,
      end_time: shift.endTime,
    })),
  );

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("staff_hours").insert(rows);
    if (insertError) {
      return { ok: false, code: "OVERLAP" };
    }
  }

  return { ok: true, data: { membershipId } };
}

export async function addTimeOff(
  actor: Actor,
  shopId: string,
  membershipId: string,
  input: TimeOffInput,
): Promise<StaffResult<{ id: string }>> {
  try {
    requireSelfOrOwner(actor, shopId, membershipId);
  } catch {
    return { ok: false, code: "FORBIDDEN" };
  }

  const parsed = timeOffInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("time_off")
    .insert({
      shop_id: shopId,
      membership_id: membershipId,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      note: parsed.data.note ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, code: error?.message.match(/exclude|overlap/i) ? "OVERLAP" : "UNKNOWN" };
  }

  return { ok: true, data: { id: data.id } };
}

export async function getInviteSummary(token: string) {
  const supabase = createServiceRoleClient();
  const invite = await getInviteByToken(supabase, token);
  if (!invite || invite.accepted_at) {
    return { ok: false as const, code: "INVITE_INVALID" };
  }
  if (new Date(invite.expires_at).getTime() <= Date.now()) {
    return { ok: false as const, code: "INVITE_EXPIRED" };
  }
  return {
    ok: true as const,
    data: {
      shopName: invite.shop?.name ?? "Shop",
      shopSlug: invite.shop?.slug ?? "",
      email: invite.email,
      role: invite.role,
    },
  };
}

export async function acceptInvite(actor: Actor, token: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("accept_staff_invite", { p_token: token });

  if (error) {
    const message = error.message ?? "";
    if (/INVITE_EXPIRED/i.test(message)) return { ok: false as const, code: "INVITE_EXPIRED" };
    if (/ALREADY_MEMBER/i.test(message)) return { ok: false as const, code: "ALREADY_MEMBER" };
    return { ok: false as const, code: "INVITE_INVALID" };
  }

  if (data?.shop_id) {
    revalidateShopPublic(data.shop_id);
  }

  return { ok: true as const, data };
}
