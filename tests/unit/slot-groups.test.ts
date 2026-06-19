import { describe, expect, it } from "vitest";

import { groupSlotsByPeriod } from "@/lib/booking/slot-groups";

describe("groupSlotsByPeriod", () => {
  it("groups slots into morning, afternoon, and evening", () => {
    const groups = groupSlotsByPeriod(
      [
        { startsAt: "2026-06-15T08:00:00+02:00", membershipId: "a" },
        { startsAt: "2026-06-15T13:00:00+02:00", membershipId: "a" },
        { startsAt: "2026-06-15T18:00:00+02:00", membershipId: "a" },
      ],
      "Europe/Berlin",
    );

    expect(groups.map((group) => group.period)).toEqual(["morning", "afternoon", "evening"]);
    expect(groups[0]?.slots).toHaveLength(1);
    expect(groups[1]?.slots).toHaveLength(1);
    expect(groups[2]?.slots).toHaveLength(1);
  });
});
