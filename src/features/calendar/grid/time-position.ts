import type { GridWindow } from "./types";

const MS_PER_MINUTE = 60_000;

export function minutesBetween(startMs: number, endMs: number): number {
  return (endMs - startMs) / MS_PER_MINUTE;
}

export function timeToY(
  instantMs: number,
  window: GridWindow,
  pxPerMinute: number,
): number {
  const minutesFromStart = minutesBetween(window.startMs, instantMs);
  return minutesFromStart * pxPerMinute;
}

export function yToTime(
  yPx: number,
  window: GridWindow,
  pxPerMinute: number,
): number {
  const minutes = yPx / pxPerMinute;
  return window.startMs + minutes * MS_PER_MINUTE;
}

export function blockHeightPx(durationMin: number, pxPerMinute: number): number {
  return Math.max(durationMin * pxPerMinute, pxPerMinute);
}

export function gridTotalHeightPx(window: GridWindow, pxPerMinute: number): number {
  return minutesBetween(window.startMs, window.endMs) * pxPerMinute;
}
