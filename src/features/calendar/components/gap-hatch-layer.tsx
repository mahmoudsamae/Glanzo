import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";
import type { GridWindow } from "../grid";
import { timeToY, blockHeightPx } from "../grid";

const GAP_MIN_MS = 30 * 60_000;

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
  const active = appointments
    .filter((item) => item.status === "booked")
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

  const gaps: Array<{ startMs: number; endMs: number }> = [];
  let cursor = window.startMs;
  for (const appointment of active) {
    const startMs = new Date(appointment.startsAt).getTime();
    if (startMs - cursor >= GAP_MIN_MS) {
      gaps.push({ startMs: cursor, endMs: startMs });
    }
    cursor = Math.max(cursor, new Date(appointment.endsAt).getTime());
  }
  if (window.endMs - cursor >= GAP_MIN_MS) {
    gaps.push({ startMs: cursor, endMs: window.endMs });
  }

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
