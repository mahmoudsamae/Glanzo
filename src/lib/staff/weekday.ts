/** DB staff_hours.weekday: 0 = Monday … 6 = Sunday (ISO weekday minus 1). */
export const STAFF_WEEKDAY_ORDER = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type StaffWeekdayKey = (typeof STAFF_WEEKDAY_ORDER)[number];

export const STAFF_WEEKDAY_LABELS: Record<StaffWeekdayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function staffWeekdayKeyToIndex(key: StaffWeekdayKey): number {
  return STAFF_WEEKDAY_ORDER.indexOf(key);
}

export function staffWeekdayIndexToKey(index: number): StaffWeekdayKey {
  const key = STAFF_WEEKDAY_ORDER[index];
  if (!key) {
    throw new Error(`Invalid staff weekday index: ${index}`);
  }
  return key;
}
