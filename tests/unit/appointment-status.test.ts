import { describe, expect, it } from "vitest";

import { validateAppointmentStatusTransition } from "@/server/modules/appointments/appointment-status";

const startsAt = new Date("2026-06-15T10:00:00.000Z");

describe("validateAppointmentStatusTransition", () => {
  it("allows booked → cancelled anytime", () => {
    const now = new Date("2026-06-15T09:00:00.000Z");
    expect(validateAppointmentStatusTransition("booked", "cancelled", startsAt, now)).toEqual({
      ok: true,
    });
  });

  it("blocks completed/no_show before starts_at", () => {
    const now = new Date("2026-06-15T09:59:00.000Z");
    expect(validateAppointmentStatusTransition("booked", "completed", startsAt, now)).toEqual({
      ok: false,
      code: "TOO_EARLY",
    });
    expect(validateAppointmentStatusTransition("booked", "no_show", startsAt, now)).toEqual({
      ok: false,
      code: "TOO_EARLY",
    });
  });

  it("allows completed/no_show at or after starts_at", () => {
    const now = new Date("2026-06-15T10:00:00.000Z");
    expect(validateAppointmentStatusTransition("booked", "completed", startsAt, now)).toEqual({
      ok: true,
    });
    expect(validateAppointmentStatusTransition("booked", "no_show", startsAt, now)).toEqual({
      ok: true,
    });
  });

  it("never resurrects terminal statuses", () => {
    const now = new Date("2026-06-16T10:00:00.000Z");
    expect(
      validateAppointmentStatusTransition("cancelled", "booked" as "completed", startsAt, now),
    ).toEqual({ ok: false, code: "INVALID_TRANSITION" });
    expect(validateAppointmentStatusTransition("completed", "cancelled", startsAt, now)).toEqual({
      ok: false,
      code: "INVALID_TRANSITION",
    });
    expect(validateAppointmentStatusTransition("no_show", "completed", startsAt, now)).toEqual({
      ok: false,
      code: "INVALID_TRANSITION",
    });
  });
});
