import { describe, expect, it } from "vitest";

import { pickNearestAlternativeSlots } from "@/server/modules/booking/alternative-slots";
import type { AvailabilitySlot } from "@/server/modules/availability";

function slot(at: string, membershipId = "barber-a"): AvailabilitySlot {
  const startsAt = new Date(at);
  return {
    membershipId,
    startsAt,
    endsAt: new Date(startsAt.getTime() + 30 * 60_000),
  };
}

describe("pickNearestAlternativeSlots", () => {
  const slots = [
    slot("2026-07-06T07:00:00.000Z"),
    slot("2026-07-06T08:00:00.000Z"),
    slot("2026-07-06T09:00:00.000Z"),
    slot("2026-07-06T11:00:00.000Z"),
  ];

  it("returns the three starts closest to the requested time", () => {
    const requested = new Date("2026-07-06T08:30:00.000Z");
    const picks = pickNearestAlternativeSlots(slots, requested, 3);
    expect(picks.map((s) => s.startsAt.toISOString())).toEqual([
      "2026-07-06T08:00:00.000Z",
      "2026-07-06T09:00:00.000Z",
      "2026-07-06T07:00:00.000Z",
    ]);
  });

  it("returns fewer than limit when not enough slots exist", () => {
    const picks = pickNearestAlternativeSlots(slots.slice(0, 2), new Date(), 3);
    expect(picks).toHaveLength(2);
  });

  it("returns empty for empty input", () => {
    expect(pickNearestAlternativeSlots([], new Date(), 3)).toEqual([]);
  });

  it("tie-breaks equal distance by earlier start time", () => {
    const symmetric = [slot("2026-07-06T07:00:00.000Z"), slot("2026-07-06T09:00:00.000Z")];
    const picks = pickNearestAlternativeSlots(symmetric, new Date("2026-07-06T08:00:00.000Z"), 1);
    expect(picks[0]?.startsAt.toISOString()).toBe("2026-07-06T07:00:00.000Z");
  });
});
