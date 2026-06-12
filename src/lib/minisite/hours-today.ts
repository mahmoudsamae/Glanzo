import { TZDate } from "@date-fns/tz";

import {
  WEEKDAY_ORDER,
  type OpeningHours,
  type WeekdayKey,
} from "@/lib/validations/shop";

function weekdayKeyForDate(date: Date, timezone: string): WeekdayKey {
  const zoned = new TZDate(date.getTime(), timezone);
  const dayIndex = zoned.getDay();
  const map: WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[dayIndex] ?? "mon";
}

/** German-first hours line for the hero — computed in shop timezone. */
export function formatHoursTodayLine(
  openingHours: OpeningHours,
  timezone: string,
  now: Date = new Date(),
): string {
  const key = weekdayKeyForDate(now, timezone);
  const day = openingHours[key];

  if (!day) {
    return "Heute geschlossen";
  }

  return `Heute ${day.open}–${day.close} Uhr`;
}

export function orderedWeekdays(): WeekdayKey[] {
  return [...WEEKDAY_ORDER];
}
