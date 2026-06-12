"use client";

import { useEffect, useMemo, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { AppointmentListItem, BarberColumn } from "@/server/modules/appointments/appointments.types";
import type { OpeningHours } from "@/lib/validations/shop";
import {
  cutLineY,
  DEFAULT_PX_PER_MINUTE,
  formatWeekdayLabel,
  gridTotalHeightPx,
  shopDayWindow,
  weekDatesFromAnchor,
} from "../grid";
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

type CalendarWeekGridProps = {
  anchorDate: string;
  timezone: string;
  openingHours: OpeningHours;
  barber: BarberColumn;
  appointments: AppointmentListItem[];
  slotGranularityMin: number;
  nowMs: number;
  role: "owner" | "barber";
  actorMembershipId: string;
  landingIds: ReadonlySet<string>;
  showCancelled: boolean;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
  onMoveAppointment: (input: {
    appointmentId: string;
    startsAt: string;
    membershipId?: string;
  }) => void;
};

const COLUMN_WIDTH_PX = 120;
const COLUMN_GUTTER_PX = 6;

export function CalendarWeekGrid({
  anchorDate,
  timezone,
  openingHours,
  barber,
  appointments,
  slotGranularityMin,
  nowMs,
  role,
  actorMembershipId,
  landingIds,
  showCancelled,
  onSelectAppointment,
  onMoveAppointment,
}: CalendarWeekGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const pxPerMinute = DEFAULT_PX_PER_MINUTE;
  const weekDates = useMemo(
    () => weekDatesFromAnchor(anchorDate, timezone),
    [anchorDate, timezone],
  );

  const todayDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(nowMs)),
    [nowMs, timezone],
  );

  const windows = useMemo(
    () =>
      weekDates.map((date) => ({
        date,
        window: shopDayWindow(date, timezone, openingHours),
      })),
    [weekDates, timezone, openingHours],
  );

  const referenceWindow = windows.find((item) => item.window)?.window ?? null;
  const gridHeightPx = referenceWindow
    ? gridTotalHeightPx(referenceWindow, pxPerMinute)
    : 0;
  const cutY =
    referenceWindow && weekDates.includes(todayDate)
      ? cutLineY(nowMs, referenceWindow, pxPerMinute)
      : null;

  useEffect(() => {
    if (!referenceWindow || didAutoScroll.current || cutY === null) {
      return;
    }
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    didAutoScroll.current = true;
    const target = Math.max(0, cutY - el.clientHeight / 3);
    el.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
  }, [cutY, reducedMotion, referenceWindow]);

  const visibleAppointments = useMemo(
    () =>
      appointments.filter(
        (item) =>
          item.membershipId === barber.membershipId &&
          (showCancelled || item.status !== "cancelled"),
      ),
    [appointments, barber.membershipId, showCancelled],
  );

  return (
    <div ref={scrollRef} className="flex min-h-0 flex-1 overflow-auto">
      {referenceWindow ? (
        <TimeAxis
          window={referenceWindow}
          timezone={timezone}
          pxPerMinute={pxPerMinute}
          gridHeightPx={gridHeightPx}
        />
      ) : null}
      <div className="min-w-0 flex-1 overflow-x-auto snap-x snap-mandatory">
        <div
          className="relative flex"
          style={{
            height: gridHeightPx,
            minWidth: weekDates.length * (COLUMN_WIDTH_PX + COLUMN_GUTTER_PX),
          }}
        >
          {windows.map(({ date, window }) => {
            if (!window) {
              return (
                <div
                  key={date}
                  className="shrink-0 snap-start border-r border-border px-[var(--space-1)] pt-10 text-center text-xs text-muted-foreground"
                  style={{ width: COLUMN_WIDTH_PX, marginRight: COLUMN_GUTTER_PX }}
                >
                  {formatWeekdayLabel(date, timezone)}
                  <p>Closed</p>
                </div>
              );
            }

            const dayAppointments = visibleAppointments.filter(
              (item) =>
                new Intl.DateTimeFormat("en-CA", {
                  timeZone: timezone,
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date(item.startsAt)) === date,
            );

            const isToday = date === todayDate;

            return (
              <div
                key={date}
                className="relative shrink-0 snap-start"
                style={{ width: COLUMN_WIDTH_PX, marginRight: COLUMN_GUTTER_PX }}
              >
                <div className="sticky top-0 z-30 mb-[var(--space-2)] border-b border-border bg-[var(--ink-0)] py-[var(--space-2)] text-center text-xs">
                  <p className="font-medium">{formatWeekdayLabel(date, timezone)}</p>
                  <p className="text-data text-muted-foreground">{date.slice(8)}</p>
                </div>
                <div className="relative" style={{ height: gridHeightPx }}>
                  {role === "owner" ? (
                    <GapHatchLayer
                      appointments={dayAppointments}
                      window={window}
                      pxPerMinute={pxPerMinute}
                      columnWidthPx={COLUMN_WIDTH_PX}
                    />
                  ) : null}
                  <DraggableAppointmentBlocks
                    appointments={dayAppointments}
                    gridWindow={window}
                    pxPerMinute={pxPerMinute}
                    columnWidthPx={COLUMN_WIDTH_PX}
                    granularityMin={slotGranularityMin}
                    landingIds={landingIds}
                    membershipId={barber.membershipId}
                    role={role}
                    actorMembershipId={actorMembershipId}
                    onSelect={onSelectAppointment}
                    onMove={onMoveAppointment}
                  />
                  {isToday && cutY !== null ? (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
