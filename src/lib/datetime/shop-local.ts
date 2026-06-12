import { TZDate } from "@date-fns/tz";

function parseDateParts(date: string): [number, number, number] {
  const parts = date.split("-").map((part) => Number(part));
  return [parts[0]!, parts[1]! - 1, parts[2]!];
}

function parseTimeParts(time: string): [number, number] {
  const parts = time.split(":").map((part) => Number(part));
  return [parts[0]!, parts[1]!];
}

/** Wall-clock instant for YYYY-MM-DD + HH:mm in shop timezone (host TZ must not matter). */
export function shopLocalInstant(date: string, time: string, timezone: string): number {
  const [year, month, day] = parseDateParts(date);
  const [hour, minute] = parseTimeParts(time);
  return new TZDate(year, month, day, hour, minute, 0, timezone).getTime();
}

export function shopLocalMidnightMs(date: string, timezone: string): number {
  const [year, month, day] = parseDateParts(date);
  return new TZDate(year, month, day, 0, 0, 0, timezone).getTime();
}

export function shopLocalNoon(date: string, timezone: string): TZDate {
  const [year, month, day] = parseDateParts(date);
  return new TZDate(year, month, day, 12, 0, 0, timezone);
}

/** Test / fixture helper — same semantics as shopLocalInstant. */
export function shopLocalDate(date: string, time: string, timezone: string): Date {
  return new Date(shopLocalInstant(date, time, timezone));
}
