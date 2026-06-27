"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";
import {
  assignOverlapLanes,
  blockHeightPx,
  laneWidthPercent,
  snapYToGranularity,
  timeToY,
  yToTime,
  type GridWindow,
} from "../grid";
import { appointmentStatusLabel } from "../utils";
import { StatusDot } from "@/components/shared/status-dot";

type DraggableAppointmentBlocksProps = {
  appointments: AppointmentListItem[];
  gridWindow: GridWindow;
  pxPerMinute: number;
  columnWidthPx: number;
  granularityMin: number;
  landingIds: ReadonlySet<string>;
  membershipId: string;
  role: "owner" | "barber";
  actorMembershipId: string;
  onSelect: (appointment: AppointmentListItem) => void;
  onMove: (input: {
    appointmentId: string;
    startsAt: string;
    membershipId?: string;
  }) => void;
};

const LONG_PRESS_MS = 300;

export function DraggableAppointmentBlocks({
  appointments,
  gridWindow,
  pxPerMinute,
  columnWidthPx,
  granularityMin,
  landingIds,
  membershipId,
  role,
  actorMembershipId,
  onSelect,
  onMove,
}: DraggableAppointmentBlocksProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTopPx, setDragTopPx] = useState<number | null>(null);
  const pressTimer = useRef<number | null>(null);
  const dragState = useRef<{
    appointmentId: string;
    startY: number;
    originTop: number;
    pointerId: number;
  } | null>(null);

  const blocks = assignOverlapLanes(
    appointments.map((appointment) => ({
      id: appointment.id,
      startMs: new Date(appointment.startsAt).getTime(),
      endMs: new Date(appointment.endsAt).getTime(),
    })),
  );

  const clearPressTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const canDrag = useCallback(
    (appointment: AppointmentListItem) => {
      if (appointment.status !== "booked") {
        return false;
      }
      if (role === "owner") {
        return true;
      }
      return appointment.membershipId === actorMembershipId;
    },
    [actorMembershipId, role],
  );

  const finishDrag = useCallback(
    (appointment: AppointmentListItem, topPx: number) => {
      const snappedY = snapYToGranularity(topPx, gridWindow, pxPerMinute, granularityMin);
      const startsAt = new Date(yToTime(snappedY, gridWindow, pxPerMinute)).toISOString();
      onMove({
        appointmentId: appointment.id,
        startsAt,
        membershipId: membershipId !== appointment.membershipId ? membershipId : undefined,
      });
    },
    [granularityMin, gridWindow, membershipId, onMove, pxPerMinute],
  );

  return (
    <>
      {blocks.map((block) => {
        const appointment = appointments.find((item) => item.id === block.id);
        if (!appointment) {
          return null;
        }

        const baseTopPx = timeToY(block.startMs, gridWindow, pxPerMinute);
        const isDragging = draggingId === appointment.id;
        const topPx = isDragging && dragTopPx !== null ? dragTopPx : baseTopPx;
        const heightPx = blockHeightPx(
          (block.endMs - block.startMs) / 60_000,
          pxPerMinute,
        );
        const lane = laneWidthPercent(block.lane, block.laneCount);
        const dimmed =
          appointment.status === "completed" || appointment.status === "no_show";
        const isLanding = landingIds.has(appointment.id);
        const draggable = canDrag(appointment);

        return (
          <button
            key={appointment.id}
            type="button"
            className={cn(
              "absolute z-10 overflow-hidden rounded-sm border border-border bg-[var(--ink-1)] px-[var(--space-2)] py-[var(--space-1)] text-left touch-none",
              dimmed && "opacity-50",
              isLanding && "booking-lands",
              isDragging && "z-30 scale-[0.98] shadow-md",
              draggable && "cursor-grab active:cursor-grabbing",
            )}
            style={{
              top: topPx,
              height: heightPx,
              width: `calc(${lane.width} - 2px)`,
              left: `calc(${lane.left} + 1px)`,
              maxWidth: columnWidthPx - 2,
            }}
            onClick={() => {
              if (!isDragging) {
                onSelect(appointment);
              }
            }}
            onPointerDown={(event) => {
              if (!draggable || event.button !== 0) {
                return;
              }
              const target = event.currentTarget;
              const startDrag = () => {
                dragState.current = {
                  appointmentId: appointment.id,
                  startY: event.clientY,
                  originTop: baseTopPx,
                  pointerId: event.pointerId,
                };
                setDraggingId(appointment.id);
                setDragTopPx(baseTopPx);
                target.setPointerCapture(event.pointerId);
              };

              if (event.pointerType === "touch") {
                pressTimer.current = window.setTimeout(startDrag, LONG_PRESS_MS);
              } else {
                startDrag();
              }
            }}
            onPointerMove={(event) => {
              if (!dragState.current || dragState.current.appointmentId !== appointment.id) {
                return;
              }
              clearPressTimer();
              const delta = event.clientY - dragState.current.startY;
              const nextTop = Math.max(
                0,
                Math.min(
                  dragState.current.originTop + delta,
                  (gridWindow.endMs - gridWindow.startMs) / 60_000 * pxPerMinute - heightPx,
                ),
              );
              setDragTopPx(nextTop);
            }}
            onPointerUp={(event) => {
              clearPressTimer();
              if (!dragState.current || dragState.current.appointmentId !== appointment.id) {
                return;
              }
              event.currentTarget.releasePointerCapture(event.pointerId);
              const finalTop = dragTopPx ?? baseTopPx;
              finishDrag(appointment, finalTop);
              dragState.current = null;
              setDraggingId(null);
              setDragTopPx(null);
            }}
            onPointerCancel={() => {
              clearPressTimer();
              dragState.current = null;
              setDraggingId(null);
              setDragTopPx(null);
            }}
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
