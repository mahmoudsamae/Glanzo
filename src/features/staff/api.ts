"use server";

import { z } from "zod";

import { getActiveMembership } from "@/lib/dashboard/active-shop";
import {
  createStaffInviteInputSchema,
  staffDayHoursSchema,
  timeOffInputSchema,
} from "@/lib/validations/staff";
import { getActor } from "@/server/modules/auth/get-actor";
import {
  acceptInvite,
  addTimeOff,
  createStaffInvite,
  getInviteSummary,
  getStaffPageData,
  replaceStaffHours,
  revokeStaffInvite,
} from "@/server/modules/staff/staff.service";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

const hoursSchema = z.object({
  membershipId: z.string().uuid(),
  days: z.array(staffDayHoursSchema),
});

const timeOffSchema = z.object({
  membershipId: z.string().uuid(),
  timeOff: timeOffInputSchema,
});

async function dashboardActor() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }
  return { actor, shopId: membership.shopId, membership };
}

export async function fetchStaffPageAction() {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return getStaffPageData(ctx.actor, ctx.shopId);
}

export async function createStaffInviteAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx || ctx.membership.role !== "owner") {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = createStaffInviteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return createStaffInvite(ctx.actor, ctx.shopId, parsed.data);
}

export async function revokeStaffInviteAction(inviteId: string) {
  const ctx = await dashboardActor();
  if (!ctx || ctx.membership.role !== "owner") {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  return revokeStaffInvite(ctx.actor, ctx.shopId, inviteId);
}

export async function saveStaffHoursAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = hoursSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return replaceStaffHours(ctx.actor, ctx.shopId, parsed.data.membershipId, parsed.data.days);
}

export async function addTimeOffAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }
  const parsed = timeOffSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }
  return addTimeOff(ctx.actor, ctx.shopId, parsed.data.membershipId, parsed.data.timeOff);
}

export async function fetchInviteSummaryAction(token: string) {
  return getInviteSummary(token);
}

export async function acceptStaffInviteAction(token: string) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "NOT_AUTHENTICATED" };
  }
  return acceptInvite(ctx.actor, token);
}
