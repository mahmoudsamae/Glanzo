"use server";

import { getActiveMembership } from "@/lib/dashboard/active-shop";
import { canViewShopRevenue } from "@/lib/dashboard/nav-config";
import {
  moveAppointmentInputSchema,
  updateAppointmentStatusInputSchema,
  walkInAppointmentInputSchema,
} from "@/lib/validations/appointment";
import { getActor } from "@/server/modules/auth/get-actor";
import {
  loadDayAppointments,
  loadTodayPage,
  loadWeekAppointments,
} from "@/server/modules/appointments/appointments.loader";
import {
  createWalkInAppointment,
  moveAppointment,
  updateAppointmentStatus,
} from "@/server/modules/appointments/appointments.service";
import { requireDashboardAccess } from "@/server/modules/shops/create-shop.service";

async function dashboardActor() {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);
  if (!actor || !membership) {
    return null;
  }
  return { actor, shopId: membership.shopId, membership };
}

export async function fetchDayAppointmentsAction(input: {
  date: string;
  barberId?: string | null;
}) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }

  const data = await loadDayAppointments(
    ctx.actor,
    ctx.shopId,
    input.date,
    input.barberId,
  );
  if (!data) {
    return { ok: false as const, code: "NOT_FOUND" };
  }
  return { ok: true as const, data };
}

export async function fetchWeekAppointmentsAction(input: {
  anchorDate: string;
  barberId?: string | null;
}) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }

  const data = await loadWeekAppointments(
    ctx.actor,
    ctx.shopId,
    input.anchorDate,
    input.barberId,
  );
  if (!data) {
    return { ok: false as const, code: "NOT_FOUND" };
  }
  return { ok: true as const, data };
}

export async function fetchTodaySummaryAction(input: { date: string }) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }

  const data = await loadTodayPage(ctx.actor, ctx.shopId, input.date);
  if (!data) {
    return { ok: false as const, code: "NOT_FOUND" };
  }

  if (!canViewShopRevenue(ctx.membership.role)) {
    return {
      ok: true as const,
      data: {
        ...data,
        expectedRevenueCents: 0,
      },
    };
  }

  return { ok: true as const, data };
}

export async function createWalkInAppointmentAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }

  const parsed = walkInAppointmentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  return createWalkInAppointment(ctx.actor, ctx.shopId, parsed.data);
}

export async function updateAppointmentStatusAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }

  const parsed = updateAppointmentStatusInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  return updateAppointmentStatus(ctx.actor, ctx.shopId, parsed.data);
}

export async function moveAppointmentAction(input: unknown) {
  const ctx = await dashboardActor();
  if (!ctx) {
    return { ok: false as const, code: "FORBIDDEN" };
  }

  const parsed = moveAppointmentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  return moveAppointment(ctx.actor, ctx.shopId, parsed.data);
}
