import { TZDate } from "@date-fns/tz";
import { addDays, getISODay } from "date-fns";

import {
  shopLocalInstant,
  shopLocalMidnightMs,
  shopLocalNoon,
} from "@/lib/datetime/shop-local";
import { staffWeekdayIndexToKey } from "@/lib/staff/weekday";
import type { OpeningHours } from "@/lib/validations/shop";

import type { AppointmentBlock, MsInterval } from "./availability.types";

const MS_PER_MINUTE = 60_000;

export function shopWeekdayIndex(date: string, timezone: string): number {
  const noon = shopLocalNoon(date, timezone);
  return getISODay(noon) - 1;
}

export function localTimeOnDate(date: string, time: string, timezone: string): number {
  return shopLocalInstant(date, time, timezone);
}

export function dayStartMs(date: string, timezone: string): number {
  return shopLocalMidnightMs(date, timezone);
}

export function dayEndMs(date: string, timezone: string): number {
  return addDays(new TZDate(shopLocalMidnightMs(date, timezone), timezone), 1).getTime();
}

/** Seven ISO dates (YYYY-MM-DD) for the week containing `anchorDate`. */
export function weekDatesFromAnchor(anchorDate: string, timezone: string): string[] {
  const anchor = shopLocalNoon(anchorDate, timezone);
  const day = anchor.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(anchor, mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const d = addDays(monday, index);
    const zoned = new TZDate(d.getTime(), timezone);
    const year = zoned.getFullYear();
    const month = String(zoned.getMonth() + 1).padStart(2, "0");
    const dayNum = String(zoned.getDate()).padStart(2, "0");
    return `${year}-${month}-${dayNum}`;
  });
}

export function dateInShopTimezone(instant: Date, timezone: string): string {
  const zoned = new TZDate(instant.getTime(), timezone);
  const year = zoned.getFullYear();
  const month = String(zoned.getMonth() + 1).padStart(2, "0");
  const day = String(zoned.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function openingHoursInterval(
  date: string,
  openingHours: OpeningHours,
  timezone: string,
): MsInterval | null {
  const key = staffWeekdayIndexToKey(shopWeekdayIndex(date, timezone));
  const day = openingHours[key];
  if (!day) {
    return null;
  }
  return {
    startMs: localTimeOnDate(date, day.open, timezone),
    endMs: localTimeOnDate(date, day.close, timezone),
  };
}

export function intersectIntervals(a: MsInterval, b: MsInterval): MsInterval | null {
  const startMs = Math.max(a.startMs, b.startMs);
  const endMs = Math.min(a.endMs, b.endMs);
  if (startMs >= endMs) {
    return null;
  }
  return { startMs, endMs };
}

export function subtractInterval(windows: MsInterval[], block: MsInterval): MsInterval[] {
  const next: MsInterval[] = [];
  for (const window of windows) {
    if (block.endMs <= window.startMs || block.startMs >= window.endMs) {
      next.push(window);
      continue;
    }
    if (block.startMs > window.startMs) {
      next.push({ startMs: window.startMs, endMs: block.startMs });
    }
    if (block.endMs < window.endMs) {
      next.push({ startMs: block.endMs, endMs: window.endMs });
    }
  }
  return next.filter((window) => window.endMs > window.startMs);
}

export function clipToDay(interval: MsInterval, date: string, timezone: string): MsInterval | null {
  const dayStart = dayStartMs(date, timezone);
  const dayEnd = dayEndMs(date, timezone);
  return intersectIntervals(interval, { startMs: dayStart, endMs: dayEnd });
}

export function alignToGranularity(
  timestampMs: number,
  gridOriginMs: number,
  granularityMin: number,
): number {
  const granularityMs = granularityMin * MS_PER_MINUTE;
  const offset = timestampMs - gridOriginMs;
  if (offset <= 0) {
    return gridOriginMs;
  }
  const remainder = offset % granularityMs;
  return remainder === 0 ? timestampMs : timestampMs + (granularityMs - remainder);
}

export function slotsFromWindows(
  windows: MsInterval[],
  durationMin: number,
  granularityMin: number,
  earliestStartMs: number,
  gridOriginMs: number,
): Date[] {
  const durationMs = durationMin * MS_PER_MINUTE;
  const slots: Date[] = [];

  for (const window of windows) {
    let cursor = alignToGranularity(
      Math.max(window.startMs, earliestStartMs),
      gridOriginMs,
      granularityMin,
    );

    while (cursor + durationMs <= window.endMs) {
      slots.push(new Date(cursor));
      cursor += granularityMin * MS_PER_MINUTE;
    }
  }

  return slots;
}

export function blocksAvailability(status: AppointmentBlock["status"]): boolean {
  return status === "booked" || status === "completed";
}
