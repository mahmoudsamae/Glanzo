import { TZDate } from "@date-fns/tz";
import { addDays } from "date-fns";

import { shopLocalNoon } from "@/lib/datetime/shop-local";
/** Today as YYYY-MM-DD in shop timezone. */
export function todayInTimezone(timezone: string, now: Date = new Date()): string {
  const zoned = new TZDate(now.getTime(), timezone);
  const year = zoned.getFullYear();
  const month = String(zoned.getMonth() + 1).padStart(2, "0");
  const day = String(zoned.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Next N calendar days from today in shop timezone (inclusive). */
export function nextDaysInTimezone(
  timezone: string,
  count: number,
  now: Date = new Date(),
): string[] {
  const anchor = todayInTimezone(timezone, now);
  const start = shopLocalNoon(anchor, timezone);
  return Array.from({ length: count }, (_, index) => {
    const d = addDays(start, index);
    const zoned = new TZDate(d.getTime(), timezone);
    const year = zoned.getFullYear();
    const month = String(zoned.getMonth() + 1).padStart(2, "0");
    const day = String(zoned.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

export function formatDayChipLabel(
  date: string,
  timezone: string,
  today: string,
): string {
  if (date === today) {
    return "Heute";
  }
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(shopLocalNoon(date, timezone));
}

export function formatSlotTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatBookingSummaryDate(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  }).format(new Date(iso));
}
