import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireShopMember } from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

import { weekDatesFromAnchor } from "@/server/modules/availability/time-windows";

import {
  dayRangeIso,
  getShopCalendarContext,
  listAppointmentsInRange,
  listShopBarbers,
} from "./appointments.queries";
import type { DayAppointmentsPayload, TodaySummary } from "./appointments.types";
import { aggregateTodaySummary } from "./today-summary";

export async function loadDayAppointments(
  actor: Actor,
  shopId: string,
  date: string,
  membershipFilter?: string | null,
): Promise<DayAppointmentsPayload | null> {
  requireShopMember(actor, shopId);
  const membership = actor.memberships.find((m) => m.shopId === shopId);
  if (!membership) {
    return null;
  }

  const scopedMembershipId =
    membership.role === "barber" ? membership.id : membershipFilter ?? null;

  const supabase = await createServerSupabaseClient();
  const context = await getShopCalendarContext(supabase, shopId);
  if (!context) {
    return null;
  }

  const { startIso, endIso } = dayRangeIso(date, context.timezone);
  const [barbers, appointments] = await Promise.all([
    listShopBarbers(supabase, shopId),
    listAppointmentsInRange(supabase, shopId, startIso, endIso, scopedMembershipId),
  ]);

  const visibleBarbers = scopedMembershipId
    ? barbers.filter((barber) => barber.membershipId === scopedMembershipId)
    : barbers;

  return {
    date,
    timezone: context.timezone,
    barbers: visibleBarbers,
    appointments,
    slotGranularityMin: context.slotGranularityMin,
    openingHours: context.openingHours,
  };
}

export async function loadWeekAppointments(
  actor: Actor,
  shopId: string,
  anchorDate: string,
  membershipFilter?: string | null,
): Promise<DayAppointmentsPayload | null> {
  requireShopMember(actor, shopId);
  const membership = actor.memberships.find((m) => m.shopId === shopId);
  if (!membership) {
    return null;
  }

  const scopedMembershipId =
    membership.role === "barber" ? membership.id : membershipFilter ?? null;

  const supabase = await createServerSupabaseClient();
  const context = await getShopCalendarContext(supabase, shopId);
  if (!context) {
    return null;
  }

  const weekDates = weekDatesFromAnchor(anchorDate, context.timezone);
  const firstDay = weekDates[0];
  const lastDay = weekDates[weekDates.length - 1];
  if (!firstDay || !lastDay) {
    return null;
  }

  const { startIso } = dayRangeIso(firstDay, context.timezone);
  const { endIso } = dayRangeIso(lastDay, context.timezone);

  const [barbers, appointments] = await Promise.all([
    listShopBarbers(supabase, shopId),
    listAppointmentsInRange(supabase, shopId, startIso, endIso, scopedMembershipId),
  ]);

  const visibleBarbers =
    membership.role === "barber"
      ? barbers.filter((barber) => barber.membershipId === membership.id)
      : barbers;

  return {
    date: anchorDate,
    timezone: context.timezone,
    barbers: visibleBarbers,
    appointments,
    slotGranularityMin: context.slotGranularityMin,
    openingHours: context.openingHours,
  };
}

export async function loadTodayPage(
  actor: Actor,
  shopId: string,
  date: string,
): Promise<
  (TodaySummary & {
    timezone: string;
    shopSlug: string;
    openingHours: DayAppointmentsPayload["openingHours"];
  }) | null
> {
  const day = await loadDayAppointments(actor, shopId, date);
  if (!day) {
    return null;
  }

  const membership = actor.memberships.find((m) => m.shopId === shopId);
  if (!membership) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const context = await getShopCalendarContext(supabase, shopId);
  if (!context) {
    return null;
  }

  return {
    ...aggregateTodaySummary(day.appointments, day.openingHours, date, context.timezone),
    timezone: context.timezone,
    shopSlug: context.slug,
    openingHours: day.openingHours,
  };
}
