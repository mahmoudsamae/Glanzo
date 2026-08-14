import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";

import type { GridWindow } from "./types";

const GAP_MIN_MS = 30 * 60_000;

export type Gap = { startMs: number; endMs: number };

/** Sellable free-time windows (≥30min) between sorted `booked` appointments within a window. */
export function computeGaps(appointments: AppointmentListItem[], window: GridWindow): Gap[] {
  const active = appointments
    .filter((item) => item.status === "booked")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const gaps: Gap[] = [];
  let cursor = window.startMs;
  for (const appointment of active) {
    const startMs = new Date(appointment.startsAt).getTime();
    if (startMs - cursor >= GAP_MIN_MS) {
      gaps.push({ startMs: cursor, endMs: startMs });
    }
    cursor = Math.max(cursor, new Date(appointment.endsAt).getTime());
  }
  if (window.endMs - cursor >= GAP_MIN_MS) {
    gaps.push({ startMs: cursor, endMs: window.endMs });
  }

  return gaps;
}
