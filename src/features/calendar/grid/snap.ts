import type { GridWindow } from "./types";
import { yToTime } from "./time-position";

const MS_PER_MINUTE = 60_000;

export function snapInstantToGranularity(
  instantMs: number,
  granularityMin: number,
  anchorMs: number,
): number {
  if (granularityMin <= 0) {
    return instantMs;
  }
  const stepMs = granularityMin * MS_PER_MINUTE;
  const offset = instantMs - anchorMs;
  const snapped = Math.round(offset / stepMs) * stepMs;
  return anchorMs + snapped;
}

export function snapYToGranularity(
  yPx: number,
  window: GridWindow,
  pxPerMinute: number,
  granularityMin: number,
): number {
  const raw = yToTime(yPx, window, pxPerMinute);
  const snapped = snapInstantToGranularity(raw, granularityMin, window.startMs);
  const minutes = (snapped - window.startMs) / MS_PER_MINUTE;
  return minutes * pxPerMinute;
}
