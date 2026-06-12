/** German weekday + calendar date in shop timezone (e.g. Montag, 5. Oktober 2026). */
export function formatEmailWeekdayDate(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(iso));
}

/** German time with Uhr suffix (e.g. 09:00 Uhr). */
export function formatEmailTime(iso: string, timezone: string): string {
  const time = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
  return `${time} Uhr`;
}

/** One-line summary for reminder emails. */
export function formatEmailOneLineSummary(iso: string, timezone: string): string {
  const date = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
  return `${date} Uhr`;
}

/** YYYY-MM-DD in shop timezone for calendar deep links. */
export function calendarDateParam(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}
