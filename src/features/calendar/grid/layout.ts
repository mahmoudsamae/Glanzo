import type { OpeningHours } from "@/lib/validations/shop";
import { localTimeOnDate, shopWeekdayIndex } from "@/server/modules/availability/time-windows";

import { GRID_PADDING_MIN } from "./constants";
import type { ColumnLayout, GridWindow } from "./types";

const MS_PER_MINUTE = 60_000;
const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function parseHm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function shopDayWindow(
  date: string,
  timezone: string,
  openingHours: OpeningHours,
  paddingMin = GRID_PADDING_MIN,
): GridWindow | null {
  const weekday = shopWeekdayIndex(date, timezone);
  const dayKey = WEEKDAY_KEYS[weekday];
  if (!dayKey) {
    return null;
  }
  const hours = openingHours[dayKey];
  if (!hours) {
    return null;
  }

  const openMs = localTimeOnDate(date, hours.open, timezone);
  const closeMs = localTimeOnDate(date, hours.close, timezone);
  return {
    startMs: openMs - paddingMin * MS_PER_MINUTE,
    endMs: closeMs + paddingMin * MS_PER_MINUTE,
  };
}

export function computeColumnLayout(
  containerWidthPx: number,
  columnCount: number,
  gutterPx: number,
): ColumnLayout {
  if (columnCount <= 0) {
    return { columnWidthPx: 0, columnCount: 0, gutterPx };
  }
  const totalGutter = gutterPx * (columnCount - 1);
  const columnWidthPx = Math.max(0, (containerWidthPx - totalGutter) / columnCount);
  return { columnWidthPx, columnCount, gutterPx };
}

export function columnOffsetPx(index: number, layout: ColumnLayout): number {
  return index * (layout.columnWidthPx + layout.gutterPx);
}

export function cutLineY(
  nowMs: number,
  window: GridWindow,
  pxPerMinute: number,
): number | null {
  if (nowMs < window.startMs || nowMs > window.endMs) {
    return null;
  }
  return ((nowMs - window.startMs) / MS_PER_MINUTE) * pxPerMinute;
}

export function isPastInstant(instantMs: number, nowMs: number): boolean {
  return instantMs < nowMs;
}

export function dayDurationMinutes(open: string, close: string): number {
  return parseHm(close) - parseHm(open);
}
