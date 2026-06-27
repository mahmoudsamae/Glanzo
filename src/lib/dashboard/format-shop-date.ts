/** Long-form date parts for the Today header, e.g. "Thursday, 12 June". */
export function formatShopTodayParts(timezone: string, now: Date = new Date()): {
  weekday: string;
  day: string;
  month: string;
} {
  const formatter = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  });

  const parts = formatter.formatToParts(now);

  return {
    weekday: parts.find((part) => part.type === "weekday")?.value ?? "",
    day: parts.find((part) => part.type === "day")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
  };
}
