"use client";

import { useEffect, useMemo, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import {
  computeColumnLayout,
  cutLineY,
  DEFAULT_PX_PER_MINUTE,
  gridTotalHeightPx,
  shopDayWindow,
} from "../grid";
import type { AppointmentListItem, BarberColumn } from "@/server/modules/appointments/appointments.types";
import type { OpeningHours } from "@/lib/validations/shop";
import dynamic from "next/dynamic";

import { CalendarCutLine } from "./calendar-cut-line.client";
import { GapHatchLayer } from "./gap-hatch-layer";

const DraggableAppointmentBlocks = dynamic(
  () =>
    import("./draggable-appointment-blocks.client").then(
      (mod) => mod.DraggableAppointmentBlocks,
    ),
  { ssr: false },
);
import { TimeAxis } from "./time-axis";
import { barberInitial } from "../utils";

type CalendarDayGridProps = {
  date: string;
  timezone: string;
  openingHours: OpeningHours;
  barbers: BarberColumn[];
  appointments: AppointmentListItem[];
  slotGranularityMin: number;
  nowMs: number;
  showCancelled: boolean;
  landingIds: ReadonlySet<string>;
  role: "owner" | "barber";
  actorMembershipId: string;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
  onMoveAppointment: (input: {
    appointmentId: string;
    startsAt: string;
    membershipId?: string;
  }) => void;
};

const COLUMN_GUTTER_PX = 8;
const MIN_COLUMN_WIDTH_PX = 140;

export function CalendarDayGrid({
  date,
  timezone,
  openingHours,
  barbers,
  appointments,
  slotGranularityMin,
  nowMs,
  showCancelled,
  landingIds,
  role,
  actorMembershipId,
  onSelectAppointment,
  onMoveAppointment,
}: CalendarDayGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const pxPerMinute = DEFAULT_PX_PER_MINUTE;

  const window = useMemo(
    () => shopDayWindow(date, timezone, openingHours),
    [date, timezone, openingHours],
  );

  const visibleAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => showCancelled || appointment.status !== "cancelled",
      ),
    [appointments, showCancelled],
  );

  const gridHeightPx = window ? gridTotalHeightPx(window, pxPerMinute) : 0;
  const cutY = window ? cutLineY(nowMs, window, pxPerMinute) : null;
  const columnCount = Math.max(barbers.length, 1);
  const layout = computeColumnLayout(
    columnCount * MIN_COLUMN_WIDTH_PX + COLUMN_GUTTER_PX * (columnCount - 1),
    columnCount,
    COLUMN_GUTTER_PX,
  );
  const columnWidthPx = Math.max(MIN_COLUMN_WIDTH_PX, layout.columnWidthPx);

  const appointmentsByBarber = useMemo(() => {
    const map = new Map<string, AppointmentListItem[]>();
    for (const barber of barbers) {
      map.set(barber.membershipId, []);
    }
    for (const appointment of visibleAppointments) {
      const list = map.get(appointment.membershipId);
      if (list) {
        list.push(appointment);
      }
    }
    return map;
  }, [barbers, visibleAppointments]);

  useEffect(() => {
    if (!window || didAutoScroll.current || cutY === null) {
      return;
    }
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    didAutoScroll.current = true;
    const target = Math.max(0, cutY - el.clientHeight / 3);
    el.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
  }, [cutY, reducedMotion, window]);

  if (!window) {
    return (
      <p className="py-[var(--space-8)] text-center text-muted-foreground">
        Shop closed this day.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 overflow-auto"
      >
        <TimeAxis
          window={window}
          timezone={timezone}
          pxPerMinute={pxPerMinute}
          gridHeightPx={gridHeightPx}
        />
        <div className="min-w-0 flex-1 overflow-x-auto snap-x snap-mandatory">
          <div
            className="relative flex"
            style={{
              height: gridHeightPx,
              minWidth: columnCount * (columnWidthPx + COLUMN_GUTTER_PX),
            }}
          >
            {barbers.map((barber) => (
              <div
                key={barber.membershipId}
                className="relative shrink-0 snap-start"
                style={{ width: columnWidthPx, marginRight: COLUMN_GUTTER_PX }}
              >
                <div className="sticky top-0 z-30 mb-[var(--space-2)] flex h-9 items-center border-b border-border bg-[var(--ink-0)]">
                  <span className="inline-flex size-6 items-center justify-center rounded-full border border-border text-xs font-medium">
                    {barberInitial(barber.displayName)}
                  </span>
                  <span className="ml-[var(--space-2)] truncate text-sm">
                    {barber.displayName}
                  </span>
                </div>
                <div className="relative" style={{ height: gridHeightPx }}>
                  {role === "owner" ? (
                    <GapHatchLayer
                      appointments={appointmentsByBarber.get(barber.membershipId) ?? []}
                      window={window}
                      pxPerMinute={pxPerMinute}
                      columnWidthPx={columnWidthPx}
                    />
                  ) : null}
                  <DraggableAppointmentBlocks
                    appointments={appointmentsByBarber.get(barber.membershipId) ?? []}
                    gridWindow={window}
                    pxPerMinute={pxPerMinute}
                    columnWidthPx={columnWidthPx}
                    granularityMin={slotGranularityMin}
                    landingIds={landingIds}
                    membershipId={barber.membershipId}
                    role={role}
                    actorMembershipId={actorMembershipId}
                    onSelect={onSelectAppointment}
                    onMove={onMoveAppointment}
                  />
                </div>
              </div>
            ))}

            {cutY !== null ? (
              <>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-[15] bg-[var(--ink-0)]/30"
                  style={{ height: cutY }}
                  aria-hidden
                />
                <CalendarCutLine topPx={cutY} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
