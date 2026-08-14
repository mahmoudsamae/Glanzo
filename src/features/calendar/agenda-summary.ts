import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";

export type AgendaSummary = {
  /** Non-cancelled appointments, sorted by start time. */
  active: AppointmentListItem[];
  /** First appointment starting at/after `nowMs`, else the first active appointment. */
  upcoming: AppointmentListItem | null;
  revenueCents: number;
};

export function computeAgendaSummary(appointments: AppointmentListItem[], nowMs: number): AgendaSummary {
  const active = appointments
    .filter((appointment) => appointment.status !== "cancelled")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const upcoming =
    active.find((appointment) => new Date(appointment.startsAt).getTime() >= nowMs) ?? active[0] ?? null;

  const revenueCents = active.reduce((sum, appointment) => sum + appointment.priceCents, 0);

  return { active, upcoming, revenueCents };
}
