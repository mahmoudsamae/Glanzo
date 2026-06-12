import { describe, expect, it } from "vitest";

import { generateBookingIcs } from "@/lib/booking/ics";

describe("generateBookingIcs", () => {
  it("emits a valid VCALENDAR block", () => {
    const ics = generateBookingIcs({
      shopName: "Demo Barber",
      serviceName: "Haarschnitt",
      startsAt: "2025-06-10T08:00:00.000Z",
      endsAt: "2025-06-10T08:30:00.000Z",
      location: "Hauptstr. 1",
      uid: "test-uid@glanzo.app",
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:test-uid@glanzo.app");
    expect(ics).toContain("SUMMARY:Haarschnitt — Demo Barber");
    expect(ics).toContain("LOCATION:Hauptstr. 1");
    expect(ics).toContain("DTSTART:");
    expect(ics).toContain("DTEND:");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("escapes special characters in text fields", () => {
    const ics = generateBookingIcs({
      shopName: "Cut; Co",
      serviceName: "Beard, trim",
      startsAt: "2025-06-10T08:00:00.000Z",
      endsAt: "2025-06-10T08:30:00.000Z",
    });
    expect(ics).toContain("Beard\\, trim");
    expect(ics).toContain("Cut\\; Co");
  });
});
