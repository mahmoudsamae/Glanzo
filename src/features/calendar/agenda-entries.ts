import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";

import type { Gap } from "./grid";

export type AgendaEntry =
  | { kind: "appointment"; startMs: number; appointment: AppointmentListItem }
  | { kind: "gap"; startMs: number; gap: Gap };

/** Time-sorted merge of appointment cards and free-slot gaps for an agenda list. */
export function buildAgendaEntries(appointments: AppointmentListItem[], gaps: Gap[]): AgendaEntry[] {
  const entries: AgendaEntry[] = [
    ...appointments.map((appointment) => ({
      kind: "appointment" as const,
      startMs: new Date(appointment.startsAt).getTime(),
      appointment,
    })),
    ...gaps.map((gap) => ({ kind: "gap" as const, startMs: gap.startMs, gap })),
  ];
  entries.sort((a, b) => a.startMs - b.startMs);
  return entries;
}
