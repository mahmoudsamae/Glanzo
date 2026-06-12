export type AppointmentStatus = "booked" | "completed" | "no_show" | "cancelled";

export type StatusTransitionTarget = "completed" | "no_show" | "cancelled";

export type StatusTransitionError = "INVALID_TRANSITION" | "TOO_EARLY";

export function validateAppointmentStatusTransition(
  current: AppointmentStatus,
  next: StatusTransitionTarget,
  startsAt: Date,
  now: Date,
): { ok: true } | { ok: false; code: StatusTransitionError } {
  if (current !== "booked") {
    return { ok: false, code: "INVALID_TRANSITION" };
  }

  if (next === "completed" || next === "no_show") {
    if (now.getTime() < startsAt.getTime()) {
      return { ok: false, code: "TOO_EARLY" };
    }
  }

  return { ok: true };
}
