import type { OpeningHours } from "@/lib/validations/shop";
import { shopWeekdayIndex } from "@/server/modules/availability/time-windows";

import type { AppointmentListItem, TodaySummary } from "./appointments.types";

const GAP_THRESHOLD_MIN = 30;

function parseHm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function countGaps(appointments: AppointmentListItem[], minGapMin = GAP_THRESHOLD_MIN): number {
  const booked = appointments
    .filter((apt) => apt.status === "booked" || apt.status === "completed")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  let gaps = 0;
  for (let index = 1; index < booked.length; index += 1) {
    const prev = booked[index - 1];
    const current = booked[index];
    if (!prev || !current) {
      continue;
    }
    const gapMin =
      (new Date(current.startsAt).getTime() - new Date(prev.endsAt).getTime()) / 60_000;
    if (gapMin >= minGapMin) {
      gaps += 1;
    }
  }
  return gaps;
}

export function aggregateTodaySummary(
  appointments: AppointmentListItem[],
  openingHours: OpeningHours,
  date: string,
  timezone: string,
): TodaySummary {
  const active = appointments.filter((apt) => apt.status !== "cancelled");
  const expectedRevenueCents = active.reduce((sum, apt) => sum + apt.priceCents, 0);
  const noShowCount = appointments.filter((apt) => apt.status === "no_show").length;
  const gapCount = countGaps(active);

  return {
    expectedRevenueCents,
    appointmentCount: active.length,
    gapCount,
    noShowCount,
    appointments: appointments.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  };
}

/** Elapsed fraction of shop working day (0–1) for Cut Line progress variant. */
export function workingDayProgress(
  openingHours: OpeningHours,
  date: string,
  timezone: string,
  now: Date,
): number {
  const weekday = shopWeekdayIndex(date, timezone);
  const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const dayKey = keys[weekday];
  if (!dayKey) {
    return 0;
  }
  const hours = openingHours[dayKey as keyof OpeningHours];
  if (!hours) {
    return 0;
  }

  const openMin = parseHm(hours.open);
  const closeMin = parseHm(hours.close);
  if (closeMin <= openMin) {
    return 0;
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const nowMin = hour * 60 + minute;

  if (nowMin <= openMin) {
    return 0;
  }
  if (nowMin >= closeMin) {
    return 1;
  }
  return (nowMin - openMin) / (closeMin - openMin);
}

/** Subline with only non-zero parts, e.g. "9 appointments · 2 gaps · 1 no-show". */
export function formatTodaySubline(summary: TodaySummary): string {
  const parts: string[] = [];
  if (summary.appointmentCount > 0) {
    parts.push(`${summary.appointmentCount} appointment${summary.appointmentCount === 1 ? "" : "s"}`);
  }
  if (summary.gapCount > 0) {
    parts.push(`${summary.gapCount} gap${summary.gapCount === 1 ? "" : "s"}`);
  }
  if (summary.noShowCount > 0) {
    parts.push(`${summary.noShowCount} no-show${summary.noShowCount === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}
