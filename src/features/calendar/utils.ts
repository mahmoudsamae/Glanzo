export { appointmentStatusLabel } from "@/lib/appointments/status-label";

export function formatGridTime(instantMs: number, timezone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(instantMs));
}

export function barberInitial(displayName: string): string {
  const trimmed = displayName.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

/** e.g. "1 Std 30 Min", "45 Min". */
export function formatAgendaDuration(min: number): string {
  if (min < 60) {
    return `${min} Min`;
  }
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${hours} Std ${rest} Min` : `${hours} Std`;
}

/** e.g. "in 1 Std 30 Min", or "läuft" once the start time has passed. */
export function formatAgendaCountdown(startMs: number, nowMs: number): string {
  const diffMin = Math.round((startMs - nowMs) / 60_000);
  if (diffMin <= 0) {
    return "läuft";
  }
  return `in ${formatAgendaDuration(diffMin)}`;
}
