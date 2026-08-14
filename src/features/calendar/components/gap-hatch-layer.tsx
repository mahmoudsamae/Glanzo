import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";
import type { GridWindow } from "../grid";
import { computeGaps, timeToY, blockHeightPx } from "../grid";

type GapHatchLayerProps = {
  appointments: AppointmentListItem[];
  window: GridWindow;
  pxPerMinute: number;
  columnWidthPx: number;
};

/** Owner-only sellable gaps — hatch tint for holes ≥30min. */
export function GapHatchLayer({
  appointments,
  window,
  pxPerMinute,
  columnWidthPx,
}: GapHatchLayerProps) {
  const gaps = computeGaps(appointments, window);

  return (
    <>
      {gaps.map((gap) => {
        const topPx = timeToY(gap.startMs, window, pxPerMinute);
        const heightPx = blockHeightPx(
          (gap.endMs - gap.startMs) / 60_000,
          pxPerMinute,
        );
        return (
          <div
            key={`${gap.startMs}-${gap.endMs}`}
            className="pointer-events-none absolute opacity-[0.06]"
            style={{
              top: topPx,
              height: heightPx,
              width: columnWidthPx,
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--text-2) 0, var(--text-2) 1px, transparent 1px, transparent 6px)",
            }}
            aria-hidden
          />
        );
      })}
    </>
  );
}
