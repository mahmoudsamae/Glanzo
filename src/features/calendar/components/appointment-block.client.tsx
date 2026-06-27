"use client";

import { cn } from "@/lib/utils";
import {
  assignOverlapLanes,
  blockHeightPx,
  laneWidthPercent,
  timeToY,
  type GridWindow,
} from "../grid";
import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";

import { StatusDot } from "@/components/shared/status-dot";

import { appointmentStatusLabel } from "../utils";

type AppointmentBlockProps = {
  appointments: AppointmentListItem[];
  window: GridWindow;
  pxPerMinute: number;
  columnWidthPx: number;
  landingIds: ReadonlySet<string>;
  onSelect: (appointment: AppointmentListItem) => void;
};

export function AppointmentBlocks({
  appointments,
  window,
  pxPerMinute,
  columnWidthPx,
  landingIds,
  onSelect,
}: AppointmentBlockProps) {
  const blocks = assignOverlapLanes(
    appointments.map((appointment) => ({
      id: appointment.id,
      startMs: new Date(appointment.startsAt).getTime(),
      endMs: new Date(appointment.endsAt).getTime(),
    })),
  );

  return (
    <>
      {blocks.map((block) => {
        const appointment = appointments.find((item) => item.id === block.id);
        if (!appointment) {
          return null;
        }

        const topPx = timeToY(block.startMs, window, pxPerMinute);
        const heightPx = blockHeightPx(
          (block.endMs - block.startMs) / 60_000,
          pxPerMinute,
        );
        const lane = laneWidthPercent(block.lane, block.laneCount);
        const dimmed =
          appointment.status === "completed" || appointment.status === "no_show";
        const isLanding = landingIds.has(appointment.id);

        return (
          <button
            key={appointment.id}
            type="button"
            className={cn(
              "dash-appt-block absolute z-10 overflow-hidden rounded-sm border border-border bg-[var(--ink-1)] px-[var(--space-2)] py-[var(--space-1)] text-left transition-transform",
              dimmed && "opacity-50",
              isLanding && "booking-lands",
            )}
            style={{
              top: topPx,
              height: heightPx,
              width: `calc(${lane.width} - 2px)`,
              left: `calc(${lane.left} + 1px)`,
              maxWidth: columnWidthPx - 2,
            }}
            onClick={() => onSelect(appointment)}
          >
            <p className="truncate text-xs font-medium text-[var(--text-1)]">
              {appointment.serviceName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {appointment.customerName ?? "Laufkundschaft"}
            </p>
            <StatusDot
              label={appointmentStatusLabel(appointment.status)}
              tone={appointment.source === "walk_in" ? "barber" : "owner"}
            />
          </button>
        );
      })}
    </>
  );
}
