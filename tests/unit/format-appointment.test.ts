import { describe, expect, it } from "vitest";

import {
  appointmentDateInTimezone,
  formatAppointmentDateTime,
} from "@/lib/booking/format-appointment";

describe("formatAppointmentDateTime", () => {
  it("formats in the shop timezone", () => {
    const formatted = formatAppointmentDateTime("2027-03-15T08:00:00.000Z", "Europe/Berlin");
    expect(formatted).toMatch(/March/);
    expect(formatted).toMatch(/2027/);
  });
});

describe("appointmentDateInTimezone", () => {
  it("returns YYYY-MM-DD in shop timezone", () => {
    expect(appointmentDateInTimezone("2027-03-15T08:00:00.000Z", "Europe/Berlin")).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
