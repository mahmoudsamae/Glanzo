import { describe, expect, it } from "vitest";

import {
  assertNoOverlappingShifts,
  findOverlappingShiftIndex,
  staffShiftsOverlap,
} from "@/lib/staff/hours-overlap";
import {
  staffWeekdayIndexToKey,
  staffWeekdayKeyToIndex,
  STAFF_WEEKDAY_ORDER,
} from "@/lib/staff/weekday";

describe("staffShiftsOverlap", () => {
  it("detects overlap", () => {
    expect(
      staffShiftsOverlap({ startTime: "09:00", endTime: "13:00" }, { startTime: "12:00", endTime: "14:00" }),
    ).toBe(true);
  });

  it("allows touching boundaries", () => {
    expect(
      staffShiftsOverlap({ startTime: "09:00", endTime: "13:00" }, { startTime: "13:00", endTime: "17:00" }),
    ).toBe(false);
  });

  it("allows separate shifts", () => {
    expect(
      staffShiftsOverlap({ startTime: "09:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }),
    ).toBe(false);
  });

  it("treats nested shift as overlap", () => {
    expect(
      staffShiftsOverlap({ startTime: "09:00", endTime: "17:00" }, { startTime: "10:00", endTime: "11:00" }),
    ).toBe(true);
  });

  it("rejects invalid shifts in batch validator", () => {
    expect(assertNoOverlappingShifts([{ startTime: "13:00", endTime: "13:00" }])).toMatch(/end after start/i);
  });

  it("finds overlapping index", () => {
    const shifts = [
      { startTime: "09:00", endTime: "12:00" },
      { startTime: "13:00", endTime: "17:00" },
    ];
    expect(findOverlappingShiftIndex(shifts, { startTime: "11:00", endTime: "14:00" })).toBe(0);
    expect(findOverlappingShiftIndex(shifts, { startTime: "17:00", endTime: "18:00" })).toBe(-1);
  });
});

describe("weekday convention", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    expect(staffWeekdayKeyToIndex("mon")).toBe(0);
    expect(staffWeekdayKeyToIndex("sun")).toBe(6);
    expect(STAFF_WEEKDAY_ORDER).toHaveLength(7);
    expect(staffWeekdayIndexToKey(0)).toBe("mon");
    expect(staffWeekdayIndexToKey(6)).toBe("sun");
  });
});
