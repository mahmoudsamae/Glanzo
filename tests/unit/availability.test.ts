import { TZDate } from "@date-fns/tz";
import { shopLocalDate } from "@/lib/datetime/shop-local";
import { describe, expect, it } from "vitest";

import type { OpeningHours } from "@/lib/validations/shop";
import { staffWeekdayKeyToIndex } from "@/lib/staff/weekday";
import {
  computeAnyBarberSlots,
  computeAvailabilitySlots,
  intersectIntervals,
  pickFairBarber,
  shopWeekdayIndex,
  subtractInterval,
  type AppointmentBlock,
  type BarberAvailabilityInput,
  type ComputeAvailabilityInput,
} from "@/server/modules/availability";

const TZ = "Europe/Berlin";

const WEEKDAY_HOURS: OpeningHours = {
  mon: { open: "09:00", close: "18:00" },
  tue: { open: "09:00", close: "18:00" },
  wed: { open: "09:00", close: "18:00" },
  thu: { open: "09:00", close: "18:00" },
  fri: { open: "09:00", close: "18:00" },
  sat: null,
  sun: null,
};

function barber(
  membershipId: string,
  overrides: Partial<BarberAvailabilityInput> = {},
): BarberAvailabilityInput {
  return {
    membershipId,
    staffHours: [{ weekday: staffWeekdayKeyToIndex("mon"), startTime: "09:00", endTime: "17:00" }],
    timeOff: [],
    appointments: [],
    ...overrides,
  };
}

function baseInput(overrides: Partial<ComputeAvailabilityInput> = {}): ComputeAvailabilityInput {
  return {
    timezone: TZ,
    date: "2026-06-15",
    serviceDurationMin: 30,
    bookingLeadTimeMin: 0,
    slotGranularityMin: 15,
    openingHours: WEEKDAY_HOURS,
    now: shopLocalDate("2026-06-15", "08:00", TZ),
    barbers: [barber("barber-a"), barber("barber-b")],
    ...overrides,
  };
}

function slotStarts(slots: ReturnType<typeof computeAvailabilitySlots>): string[] {
  return slots.map((slot) => {
    const zoned = new TZDate(slot.startsAt.getTime(), TZ);
    const hh = String(zoned.getHours()).padStart(2, "0");
    const mm = String(zoned.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });
}

describe("interval helpers", () => {
  it("intersects overlapping ranges", () => {
    expect(intersectIntervals({ startMs: 0, endMs: 10 }, { startMs: 5, endMs: 15 })).toEqual({
      startMs: 5,
      endMs: 10,
    });
  });

  it("returns null for disjoint ranges", () => {
    expect(intersectIntervals({ startMs: 0, endMs: 5 }, { startMs: 6, endMs: 10 })).toBeNull();
  });

  it("subtracts a middle block into two windows", () => {
    const result = subtractInterval([{ startMs: 0, endMs: 100 }], { startMs: 40, endMs: 60 });
    expect(result).toEqual([
      { startMs: 0, endMs: 40 },
      { startMs: 60, endMs: 100 },
    ]);
  });
});

describe("shopWeekdayIndex", () => {
  it("maps Monday date to index 0", () => {
    expect(shopWeekdayIndex("2026-06-15", TZ)).toBe(0);
  });

  it("maps Sunday date to index 6", () => {
    expect(shopWeekdayIndex("2026-06-14", TZ)).toBe(6);
  });
});

describe("computeAvailabilitySlots", () => {
  it("returns slots on a standard Monday within shop and staff hours", () => {
    const slots = computeAvailabilitySlots(baseInput());
    expect(slots.length).toBeGreaterThan(0);
    expect(slotStarts(slots)[0]).toBe("09:00");
    expect(slotStarts(slots).at(-1)).toBe("16:30");
  });

  it("returns empty when shop is closed that weekday", () => {
    const slots = computeAvailabilitySlots(
      baseInput({ date: "2026-06-14", openingHours: { ...WEEKDAY_HOURS, sun: null } }),
    );
    expect(slots).toHaveLength(0);
  });

  it("falls back to shop opening hours when barber has no staff hours", () => {
    const slots = computeAvailabilitySlots(
      baseInput({ barbers: [barber("barber-a", { staffHours: [] })] }),
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slotStarts(slots)[0]).toBe("09:00");
  });

  it("clamps staff shift to narrower shop opening hours", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        openingHours: {
          ...WEEKDAY_HOURS,
          mon: { open: "10:00", close: "16:00" },
        },
        barbers: [barber("barber-a", { staffHours: [{ weekday: 0, startTime: "08:00", endTime: "20:00" }] })],
      }),
    );
    expect(slotStarts(slots)[0]).toBe("10:00");
    expect(slotStarts(slots).at(-1)).toBe("15:30");
  });

  it("supports split shifts with a lunch gap", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            staffHours: [
              { weekday: 0, startTime: "09:00", endTime: "12:00" },
              { weekday: 0, startTime: "13:00", endTime: "17:00" },
            ],
          }),
        ],
      }),
    );
    const starts = slotStarts(slots);
    expect(starts).toContain("11:30");
    expect(starts).toContain("13:00");
    expect(starts).not.toContain("12:00");
    expect(starts).not.toContain("12:15");
  });

  it("subtracts time off mid-shift", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            timeOff: [
              {
                startsAt: shopLocalDate("2026-06-15", "10:00", TZ),
                endsAt: shopLocalDate("2026-06-15", "14:00", TZ),
              },
            ],
          }),
        ],
      }),
    );
    const starts = slotStarts(slots);
    expect(starts).toContain("09:00");
    expect(starts).toContain("09:30");
    expect(starts).not.toContain("10:00");
    expect(starts).toContain("14:00");
  });

  it("subtracts booked appointments", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            appointments: [
              {
                membershipId: "barber-a",
                startsAt: shopLocalDate("2026-06-15", "11:00", TZ),
                endsAt: shopLocalDate("2026-06-15", "12:00", TZ),
                status: "booked",
              },
            ],
          }),
        ],
      }),
    );
    const starts = slotStarts(slots);
    expect(starts).toContain("10:30");
    expect(starts).not.toContain("11:00");
    expect(starts).not.toContain("11:30");
    expect(starts).toContain("12:00");
  });

  it("ignores cancelled appointments when subtracting", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            appointments: [
              {
                membershipId: "barber-a",
                startsAt: shopLocalDate("2026-06-15", "11:00", TZ),
                endsAt: shopLocalDate("2026-06-15", "12:00", TZ),
                status: "cancelled",
              },
            ],
          }),
        ],
      }),
    );
    expect(slotStarts(slots)).toContain("11:00");
  });

  it("enforces booking lead time from now", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        bookingLeadTimeMin: 90,
        now: shopLocalDate("2026-06-15", "09:00", TZ),
      }),
    );
    expect(slotStarts(slots)[0]).toBe("10:30");
  });

  it("steps slots by configured granularity", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        slotGranularityMin: 30,
        barbers: [barber("barber-a", { staffHours: [{ weekday: 0, startTime: "09:00", endTime: "11:00" }] })],
      }),
    );
    expect(slotStarts(slots)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("omits slots when service duration exceeds the shift window", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        serviceDurationMin: 90,
        barbers: [barber("barber-a", { staffHours: [{ weekday: 0, startTime: "09:00", endTime: "10:00" }] })],
      }),
    );
    expect(slots).toHaveLength(0);
  });

  it("allows a slot that ends exactly at shift end", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        serviceDurationMin: 30,
        barbers: [barber("barber-a", { staffHours: [{ weekday: 0, startTime: "09:00", endTime: "10:00" }] })],
      }),
    );
    expect(slotStarts(slots)).toEqual(["09:00", "09:15", "09:30"]);
  });

  it("filters to a single barber when membershipId is set", () => {
    const slots = computeAvailabilitySlots(baseInput({ membershipId: "barber-b" }));
    expect(slots.every((slot) => slot.membershipId === "barber-b")).toBe(true);
  });

  it("returns empty when membershipId does not match any barber", () => {
    const slots = computeAvailabilitySlots(baseInput({ membershipId: "missing" }));
    expect(slots).toHaveLength(0);
  });
});

describe("computeAnyBarberSlots (union)", () => {
  it("includes slots from every qualified barber", () => {
    const slots = computeAnyBarberSlots(baseInput());
    const ids = new Set(slots.map((slot) => slot.membershipId));
    expect(ids.has("barber-a")).toBe(true);
    expect(ids.has("barber-b")).toBe(true);
  });

  it("can return multiple barbers for the same start time", () => {
    const slots = computeAnyBarberSlots(baseInput());
    const nine = slots.filter((slot) => slotStarts([slot])[0] === "09:00");
    expect(nine.length).toBe(2);
  });
});

describe("pickFairBarber", () => {
  const appointments: AppointmentBlock[] = [
    {
      membershipId: "barber-a",
      startsAt: shopLocalDate("2026-06-15", "10:00", TZ),
      endsAt: shopLocalDate("2026-06-15", "10:30", TZ),
      status: "booked",
    },
    {
      membershipId: "barber-a",
      startsAt: shopLocalDate("2026-06-15", "11:00", TZ),
      endsAt: shopLocalDate("2026-06-15", "11:30", TZ),
      status: "booked",
    },
    {
      membershipId: "barber-b",
      startsAt: shopLocalDate("2026-06-15", "12:00", TZ),
      endsAt: shopLocalDate("2026-06-15", "12:30", TZ),
      status: "booked",
    },
  ];

  it("picks the barber with fewest appointments that day", () => {
    expect(pickFairBarber(["barber-a", "barber-b"], appointments, "2026-06-15", TZ)).toBe("barber-b");
  });

  it("tie-breaks lexicographically by membership id", () => {
    expect(pickFairBarber(["barber-b", "barber-c"], [], "2026-06-15", TZ)).toBe("barber-b");
  });

  it("ignores appointments on other shop days", () => {
    expect(
      pickFairBarber(["barber-a", "barber-b"], appointments, "2026-06-16", TZ),
    ).toBe("barber-a");
  });

  it("ignores cancelled appointments in the count", () => {
    const withCancelled: AppointmentBlock[] = [
      ...appointments,
      {
        membershipId: "barber-b",
        startsAt: shopLocalDate("2026-06-15", "13:00", TZ),
        endsAt: shopLocalDate("2026-06-15", "13:30", TZ),
        status: "cancelled",
      },
    ];
    expect(pickFairBarber(["barber-a", "barber-b"], withCancelled, "2026-06-15", TZ)).toBe("barber-b");
  });

  it("returns null for empty candidate list", () => {
    expect(pickFairBarber([], appointments, "2026-06-15", TZ)).toBeNull();
  });
});

describe("DST Europe/Berlin", () => {
  it("spring forward: skips non-existent early-morning hour on 2026-03-29", () => {
    const springHours: OpeningHours = {
      ...WEEKDAY_HOURS,
      sun: { open: "01:00", close: "05:00" },
    };
    const slots = computeAvailabilitySlots(
      baseInput({
        date: "2026-03-29",
        openingHours: springHours,
        slotGranularityMin: 30,
        serviceDurationMin: 30,
        now: shopLocalDate("2026-03-28", "12:00", TZ),
        barbers: [
          barber("barber-a", {
            staffHours: [{ weekday: 6, startTime: "01:00", endTime: "05:00" }],
          }),
        ],
      }),
    );
    const starts = slotStarts(slots);
    expect(starts).toContain("01:00");
    expect(starts).toContain("01:30");
    expect(starts).not.toContain("02:00");
    expect(starts).not.toContain("02:30");
    expect(starts).toContain("03:00");
  });

  it("fall back: allows both sides of ambiguous hour on 2026-10-25", () => {
    const fallHours: OpeningHours = {
      ...WEEKDAY_HOURS,
      sun: { open: "01:00", close: "05:00" },
    };
    const slots = computeAvailabilitySlots(
      baseInput({
        date: "2026-10-25",
        openingHours: fallHours,
        slotGranularityMin: 60,
        serviceDurationMin: 60,
        now: shopLocalDate("2026-10-24", "12:00", TZ),
        barbers: [
          barber("barber-a", {
            staffHours: [{ weekday: 6, startTime: "01:00", endTime: "05:00" }],
          }),
        ],
      }),
    );
    expect(slotStarts(slots).length).toBeGreaterThanOrEqual(3);
  });

  it("computes correct UTC offset across DST boundary for afternoon slots", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        date: "2026-03-30",
        now: shopLocalDate("2026-03-30", "07:00", TZ),
      }),
    );
    expect(slotStarts(slots)[0]).toBe("09:00");
    const utcHour = slots[0]!.startsAt.getUTCHours();
    expect(utcHour).toBe(7);
  });
});

describe("edge cases", () => {
  it("returns empty when all barbers are fully time-off", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            timeOff: [
              {
                startsAt: shopLocalDate("2026-06-15", "00:00", TZ),
                endsAt: shopLocalDate("2026-06-16", "00:00", TZ),
              },
            ],
          }),
        ],
      }),
    );
    expect(slots).toHaveLength(0);
  });

  it("returns empty when appointment blocks the entire shift", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            appointments: [
              {
                membershipId: "barber-a",
                startsAt: shopLocalDate("2026-06-15", "09:00", TZ),
                endsAt: shopLocalDate("2026-06-15", "17:00", TZ),
                status: "booked",
              },
            ],
          }),
        ],
      }),
    );
    expect(slots).toHaveLength(0);
  });

  it("slot end times equal startsAt plus service duration", () => {
    const slots = computeAvailabilitySlots(baseInput({ serviceDurationMin: 45 }));
    for (const slot of slots) {
      expect(slot.endsAt.getTime() - slot.startsAt.getTime()).toBe(45 * 60_000);
    }
  });

  it("sorts slots by start time then membership id", () => {
    const slots = computeAnyBarberSlots(baseInput());
    const sorted = [...slots].sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.membershipId.localeCompare(b.membershipId),
    );
    expect(slots.map((s) => s.startsAt.getTime())).toEqual(sorted.map((s) => s.startsAt.getTime()));
  });

  it("subtracts completed appointments the same as booked", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            appointments: [
              {
                membershipId: "barber-a",
                startsAt: shopLocalDate("2026-06-15", "12:00", TZ),
                endsAt: shopLocalDate("2026-06-15", "13:00", TZ),
                status: "completed",
              },
            ],
          }),
        ],
      }),
    );
    expect(slotStarts(slots)).not.toContain("12:00");
    expect(slotStarts(slots)).not.toContain("12:30");
  });

  it("returns empty when staff shift falls entirely outside shop hours", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        openingHours: { ...WEEKDAY_HOURS, mon: { open: "09:00", close: "12:00" } },
        barbers: [barber("barber-a", { staffHours: [{ weekday: 0, startTime: "13:00", endTime: "17:00" }] })],
      }),
    );
    expect(slots).toHaveLength(0);
  });

  it("handles Tuesday dates with weekday index 1", () => {
    expect(shopWeekdayIndex("2026-06-16", TZ)).toBe(1);
    const slots = computeAvailabilitySlots(
      baseInput({
        date: "2026-06-16",
        barbers: [barber("barber-a", { staffHours: [{ weekday: 1, startTime: "09:00", endTime: "17:00" }] })],
      }),
    );
    expect(slots.length).toBeGreaterThan(0);
  });

  it("respects 60-minute slot granularity", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        slotGranularityMin: 60,
        barbers: [barber("barber-a", { staffHours: [{ weekday: 0, startTime: "09:00", endTime: "12:00" }] })],
      }),
    );
    expect(slotStarts(slots)).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("lead time can eliminate all remaining slots late in the day", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        bookingLeadTimeMin: 600,
        now: shopLocalDate("2026-06-15", "16:00", TZ),
      }),
    );
    expect(slots).toHaveLength(0);
  });

  it("pickFairBarber counts completed appointments toward load", () => {
    const load: AppointmentBlock[] = [
      {
        membershipId: "barber-b",
        startsAt: shopLocalDate("2026-06-15", "08:00", TZ),
        endsAt: shopLocalDate("2026-06-15", "08:30", TZ),
        status: "completed",
      },
    ];
    expect(pickFairBarber(["barber-a", "barber-b"], load, "2026-06-15", TZ)).toBe("barber-a");
  });

  it("union returns empty when shop is closed", () => {
    const slots = computeAnyBarberSlots(
      baseInput({
        date: "2026-06-14",
        openingHours: { ...WEEKDAY_HOURS, sun: null },
        barbers: [
          barber("barber-a", { staffHours: [] }),
          barber("barber-b", { staffHours: [] }),
        ],
      }),
    );
    expect(slots).toHaveLength(0);
  });

  it("adjacent appointment end allows slot starting at boundary", () => {
    const slots = computeAvailabilitySlots(
      baseInput({
        barbers: [
          barber("barber-a", {
            appointments: [
              {
                membershipId: "barber-a",
                startsAt: shopLocalDate("2026-06-15", "09:00", TZ),
                endsAt: shopLocalDate("2026-06-15", "10:00", TZ),
                status: "booked",
              },
            ],
          }),
        ],
      }),
    );
    expect(slotStarts(slots)).toContain("10:00");
    expect(slotStarts(slots)).not.toContain("09:30");
  });
});
