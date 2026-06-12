import { describe, expect, it } from "vitest";

import { DEFAULT_ONBOARDING_OPENING_HOURS } from "@/lib/validations/shop";
import {
  assignOverlapLanes,
  blockHeightPx,
  columnOffsetPx,
  computeColumnLayout,
  cutLineY,
  dayDurationMinutes,
  gridTotalHeightPx,
  laneWidthPercent,
  minutesBetween,
  shopDayWindow,
  snapInstantToGranularity,
  snapYToGranularity,
  timeToY,
  weekDatesFromAnchor,
  yToTime,
} from "@/features/calendar/grid";

const TZ = "Europe/Berlin";
const DATE = "2026-06-12";
const WINDOW = { startMs: Date.parse("2026-06-12T08:00:00.000Z"), endMs: Date.parse("2026-06-12T18:00:00.000Z") };

describe("timeToY / yToTime", () => {
  it("maps start of window to y=0", () => {
    expect(timeToY(WINDOW.startMs, WINDOW, 2)).toBe(0);
  });

  it("maps 30 minutes to 60px at 2px/min", () => {
    const instant = WINDOW.startMs + 30 * 60_000;
    expect(timeToY(instant, WINDOW, 2)).toBe(60);
  });

  it("round-trips through yToTime", () => {
    const y = 120;
    const ms = yToTime(y, WINDOW, 2);
    expect(timeToY(ms, WINDOW, 2)).toBeCloseTo(y, 5);
  });

  it("computes block height from duration", () => {
    expect(blockHeightPx(30, 2)).toBe(60);
  });

  it("enforces minimum block height of one px tick", () => {
    expect(blockHeightPx(0, 2)).toBe(2);
  });

  it("computes total grid height", () => {
    expect(gridTotalHeightPx(WINDOW, 2)).toBe(minutesBetween(WINDOW.startMs, WINDOW.endMs) * 2);
  });
});

describe("snap", () => {
  it("snaps to 15-minute grid", () => {
    const anchor = WINDOW.startMs;
    const off = anchor + 7 * 60_000;
    const snapped = snapInstantToGranularity(off, 15, anchor);
    expect((snapped - anchor) / 60_000).toBe(0);
  });

  it("snaps y position to granularity", () => {
    const y = snapYToGranularity(37, WINDOW, 2, 15);
    expect(y % 30).toBe(0);
  });
});

describe("lanes", () => {
  it("assigns single lane for non-overlapping blocks", () => {
    const blocks = assignOverlapLanes([
      { id: "a", startMs: 0, endMs: 100 },
      { id: "b", startMs: 200, endMs: 300 },
    ]);
    expect(blocks.every((b) => b.lane === 0)).toBe(true);
  });

  it("assigns second lane for overlap", () => {
    const blocks = assignOverlapLanes([
      { id: "a", startMs: 0, endMs: 200 },
      { id: "b", startMs: 100, endMs: 300 },
    ]);
    expect(blocks.find((b) => b.id === "b")?.lane).toBe(1);
  });

  it("computes lane width percent", () => {
    expect(laneWidthPercent(1, 2)).toEqual({ width: "50%", left: "50%" });
  });
});

describe("layout", () => {
  it("builds shop day window with padding", () => {
    const window = shopDayWindow(DATE, TZ, DEFAULT_ONBOARDING_OPENING_HOURS);
    expect(window).not.toBeNull();
    expect(window!.endMs).toBeGreaterThan(window!.startMs);
  });

  it("returns null for closed day", () => {
    const hours = { ...DEFAULT_ONBOARDING_OPENING_HOURS, fri: null };
    expect(shopDayWindow("2026-06-12", TZ, hours)).toBeNull();
  });

  it("computes column layout", () => {
    const layout = computeColumnLayout(320, 2, 8);
    expect(layout.columnWidthPx).toBe(156);
  });

  it("offsets columns with gutter", () => {
    const layout = computeColumnLayout(300, 2, 10);
    expect(columnOffsetPx(1, layout)).toBe(layout.columnWidthPx + 10);
  });

  it("positions cut line within window", () => {
    const now = WINDOW.startMs + 60 * 60_000;
    const y = cutLineY(now, WINDOW, 2);
    expect(y).toBe(120);
  });

  it("returns null cut line outside window", () => {
    expect(cutLineY(WINDOW.endMs + 1, WINDOW, 2)).toBeNull();
  });

  it("computes open day duration", () => {
    expect(dayDurationMinutes("09:00", "17:00")).toBe(480);
  });
});

describe("week", () => {
  it("returns 7 dates for a week", () => {
    expect(weekDatesFromAnchor("2026-06-12", TZ)).toHaveLength(7);
  });

  it("week starts on Monday", () => {
    const dates = weekDatesFromAnchor("2026-06-12", TZ);
    expect(dates[0]).toBe("2026-06-08");
  });
});

describe("DST edge rendering", () => {
  it("handles 23-hour spring-forward day window math", () => {
    const hours = { ...DEFAULT_ONBOARDING_OPENING_HOURS, sun: { open: "09:00", close: "17:00" } };
    const window = shopDayWindow("2026-03-29", TZ, hours);
    expect(window).not.toBeNull();
    const minutes = minutesBetween(window!.startMs, window!.endMs);
    expect(minutes).toBeGreaterThan(400);
  });

  it("handles 25-hour fall-back day window math", () => {
    const hours = { ...DEFAULT_ONBOARDING_OPENING_HOURS, sun: { open: "09:00", close: "17:00" } };
    const window = shopDayWindow("2026-10-25", TZ, hours);
    expect(window).not.toBeNull();
    const minutes = minutesBetween(window!.startMs, window!.endMs);
    expect(minutes).toBeGreaterThan(500);
  });
});
