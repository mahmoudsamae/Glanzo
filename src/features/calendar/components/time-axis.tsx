import { minutesBetween } from "../grid";
import type { GridWindow } from "../grid";

import { formatGridTime } from "../utils";

type TimeAxisProps = {
  window: GridWindow;
  timezone: string;
  pxPerMinute: number;
  gridHeightPx: number;
};

/** Hour ticks for the calendar grid (pure render). */
export function TimeAxis({ window, timezone, pxPerMinute, gridHeightPx }: TimeAxisProps) {
  const totalMin = minutesBetween(window.startMs, window.endMs);
  const tickCount = Math.ceil(totalMin / 60) + 1;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const instantMs = window.startMs + index * 60 * 60_000;
    return {
      instantMs,
      topPx: index * 60 * pxPerMinute,
    };
  });

  return (
    <div
      className="relative w-11 shrink-0 border-r border-border pr-[var(--space-1)] text-right text-xs tabular-nums text-muted-foreground"
      style={{ height: gridHeightPx }}
      aria-hidden
    >
      {ticks.map((tick) => (
        <span
          key={tick.instantMs}
          className="absolute right-0 -translate-y-1/2"
          style={{ top: tick.topPx }}
        >
          {formatGridTime(tick.instantMs, timezone)}
        </span>
      ))}
    </div>
  );
}
