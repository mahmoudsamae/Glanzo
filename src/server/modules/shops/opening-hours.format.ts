import {
  parseOpeningHours,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type OpeningHours,
  type WeekdayKey,
} from "@/lib/validations/shop";

export type OpeningHoursLine = {
  label: string;
  value: string;
};

export function formatOpeningHoursLines(hours: unknown): OpeningHoursLine[] {
  const parsed = parseOpeningHours(hours);
  if (!parsed) {
    return [];
  }

  return WEEKDAY_ORDER.map((day) => ({
    label: WEEKDAY_LABELS[day],
    value: formatDayHours(parsed[day]),
  }));
}

function formatDayHours(day: OpeningHours[WeekdayKey]): string {
  if (day === null) {
    return "Closed";
  }
  return `${day.open} – ${day.close}`;
}
