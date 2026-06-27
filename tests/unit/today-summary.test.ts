import { describe, expect, it } from "vitest";

import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";
import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";
import {
  aggregateTodaySummary,
  countGaps,
  formatTodaySubline,
  workingDayProgress,
} from "@/server/modules/appointments/today-summary";

function apt(overrides: Partial<AppointmentListItem>): AppointmentListItem {
  return {
    id: "1",
    shopId: "s",
    customerId: null,
    membershipId: "m",
    serviceId: "svc",
    startsAt: "2026-06-12T09:00:00.000Z",
    endsAt: "2026-06-12T09:30:00.000Z",
    status: "booked",
    serviceName: "Cut",
    priceCents: 2500,
    source: "online",
    customerName: "Alex",
    customerPhone: "+491701234567",
    ...overrides,
  };
}

describe("aggregateTodaySummary", () => {
  it("sums revenue excluding cancelled", () => {
    const summary = aggregateTodaySummary(
      [apt({ priceCents: 2000 }), apt({ status: "cancelled", priceCents: 9000 })],
      DEFAULT_ONBOARDING_OPENING_HOURS,
      "2026-06-12",
      "Europe/Berlin",
    );
    expect(summary.expectedRevenueCents).toBe(2000);
    expect(summary.appointmentCount).toBe(1);
  });

  it("counts no-shows", () => {
    const summary = aggregateTodaySummary(
      [apt({ status: "no_show" })],
      DEFAULT_ONBOARDING_OPENING_HOURS,
      "2026-06-12",
      "Europe/Berlin",
    );
    expect(summary.noShowCount).toBe(1);
  });
});

describe("countGaps", () => {
  it("counts gaps ≥30 minutes", () => {
    const gaps = countGaps([
      apt({ startsAt: "2026-06-12T09:00:00.000Z", endsAt: "2026-06-12T09:30:00.000Z" }),
      apt({
        id: "2",
        startsAt: "2026-06-12T10:15:00.000Z",
        endsAt: "2026-06-12T10:45:00.000Z",
      }),
    ]);
    expect(gaps).toBe(1);
  });
});

describe("formatTodaySubline", () => {
  it("omits zero parts", () => {
    const line = formatTodaySubline({
      expectedRevenueCents: 0,
      appointmentCount: 2,
      gapCount: 0,
      noShowCount: 1,
      appointments: [],
    });
    expect(line).toBe("2 Termine · 1 No-Show");
  });
});

describe("workingDayProgress", () => {
  it("returns 0 before open", () => {
    const progress = workingDayProgress(
      DEFAULT_ONBOARDING_OPENING_HOURS,
      "2026-06-12",
      "Europe/Berlin",
      new Date("2026-06-12T06:00:00.000Z"),
    );
    expect(progress).toBe(0);
  });

  it("returns value between 0 and 1 mid-day", () => {
    const progress = workingDayProgress(
      DEFAULT_ONBOARDING_OPENING_HOURS,
      "2026-06-12",
      "Europe/Berlin",
      new Date("2026-06-12T12:00:00.000Z"),
    );
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });
});
