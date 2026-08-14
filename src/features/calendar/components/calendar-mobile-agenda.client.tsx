"use client";

import { useMemo } from "react";

import {
  DashboardRowCard,
  DashboardRowList,
  DashboardStatChip,
} from "@/components/dashboard";
import type { NavRole } from "@/components/layout/nav";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusDot } from "@/components/shared/status-dot";
import { appointmentStatusLabel } from "@/lib/appointments/status-label";
import { formatShopTodayParts } from "@/lib/dashboard/format-shop-date";
import { shopLocalNoon } from "@/lib/datetime/shop-local";
import { initials } from "@/lib/utils";
import type {
  AppointmentListItem,
  DayAppointmentsPayload,
} from "@/server/modules/appointments/appointments.types";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";

import { buildAgendaEntries } from "../agenda-entries";
import { computeAgendaSummary } from "../agenda-summary";
import { addIsoDays, horizonDates, isDateInHorizon } from "../horizon";
import { computeGaps, minutesBetween, shopDayWindow } from "../grid";
import { useDaySwipe } from "../hooks/use-day-swipe";
import { formatAgendaCountdown, formatAgendaDuration, formatGridTime } from "../utils";
import { CalendarDayPicker } from "./calendar-day-picker.client";

type CalendarMobileAgendaProps = {
  role: NavRole;
  data: DayAppointmentsPayload;
  weekAppointments: AppointmentListItem[];
  horizonStartDate: string;
  now: Date;
  onDateChange: (date: string) => void;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
  onOpenWalkIn: () => void;
};

export function CalendarMobileAgenda({
  data,
  weekAppointments,
  horizonStartDate,
  now,
  onDateChange,
  onSelectAppointment,
  onOpenWalkIn,
}: CalendarMobileAgendaProps) {
  const nowMs = now.getTime();

  const window = useMemo(
    () => shopDayWindow(data.date, data.timezone, data.openingHours),
    [data.date, data.timezone, data.openingHours],
  );

  const gaps = useMemo(
    () => (window ? computeGaps(data.appointments, window) : []),
    [data.appointments, window],
  );

  const agendaEntries = useMemo(
    () => buildAgendaEntries(data.appointments, gaps),
    [data.appointments, gaps],
  );

  const { active, upcoming } = useMemo(
    () => computeAgendaSummary(data.appointments, nowMs),
    [data.appointments, nowMs],
  );

  const weekDates = useMemo(() => horizonDates(horizonStartDate), [horizonStartDate]);

  const countsByDate = useMemo(() => {
    const counts = new Map<string, number>();
    for (const appointment of weekAppointments) {
      if (appointment.status === "cancelled") {
        continue;
      }
      const day = dateInShopTimezone(new Date(appointment.startsAt), data.timezone);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return counts;
  }, [weekAppointments, data.timezone]);

  const { weekday, day, month } = formatShopTodayParts(data.timezone, shopLocalNoon(data.date, data.timezone));
  const isToday = data.date === dateInShopTimezone(now, data.timezone);
  const monthYearKicker = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: data.timezone,
  })
    .format(shopLocalNoon(data.date, data.timezone))
    .toUpperCase();

  const swipe = useDaySwipe({
    onNext: () => {
      const next = addIsoDays(data.date, 1);
      if (isDateInHorizon(next, horizonStartDate)) {
        onDateChange(next);
      }
    },
    onPrev: () => {
      const prev = addIsoDays(data.date, -1);
      if (isDateInHorizon(prev, horizonStartDate)) {
        onDateChange(prev);
      }
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden" {...swipe}>
      <header className="shrink-0 px-[var(--space-4)] pt-[var(--space-4)]">
        <p className="salon-dash-kicker text-[10px]">{monthYearKicker}</p>
        <p className="mt-[var(--space-1)] font-display text-2xl text-[var(--text-0)]">
          {isToday ? "Heute" : weekday}, {day}. {month}
        </p>
      </header>

      <CalendarDayPicker
        weekDates={weekDates}
        timezone={data.timezone}
        activeDate={data.date}
        countsByDate={countsByDate}
        onDateChange={onDateChange}
        className="mt-[var(--space-4)] w-full shrink-0 px-[var(--space-4)]"
      />

      {upcoming ? (
        <div className="mx-[var(--space-4)] mt-[var(--space-4)] flex shrink-0 items-center gap-[var(--space-3)] rounded-2xl border border-[color:color-mix(in_oklch,var(--brass)_16%,var(--ink-3))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--brass)_14%,transparent),color-mix(in_oklch,var(--brass)_4%,transparent))] px-[var(--space-4)] py-[var(--space-3)]">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[var(--text-2)]">Nächster Termin</p>
            <p className="mt-[var(--space-1)] truncate text-sm font-semibold text-[var(--text-0)]">
              {upcoming.customerName ?? "Laufkundschaft"}
            </p>
            <p className="mt-px truncate text-xs text-[var(--text-2)]">{upcoming.serviceName}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-[var(--brass)]">
              {formatGridTime(new Date(upcoming.startsAt).getTime(), data.timezone)}
            </p>
            <p className="mt-px text-[10px] text-[var(--text-2)]">
              {formatAgendaCountdown(new Date(upcoming.startsAt).getTime(), nowMs)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-[var(--space-3)] flex shrink-0 gap-[var(--space-2)] px-[var(--space-4)] [&>div]:min-w-0 [&>div]:flex-1">
        <DashboardStatChip label="Termine" value={active.length} />
        <DashboardStatChip label="Lücken" value={gaps.length} />
      </div>

      <div className="mt-[var(--space-4)] flex-1 overflow-y-auto px-[var(--space-4)] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
        {agendaEntries.length === 0 ? (
          <EmptyState
            title="Keine Termine"
            description="Tippe auf + um einen Termin anzulegen"
            actionLabel="Laufkundschaft"
            onAction={onOpenWalkIn}
          />
        ) : (
          <DashboardRowList>
            {agendaEntries.map((entry) => {
              if (entry.kind === "gap") {
                const minutes = minutesBetween(entry.gap.startMs, entry.gap.endMs);
                return (
                  <li key={`gap-${entry.startMs}`} className="list-none">
                    <button
                      type="button"
                      onClick={onOpenWalkIn}
                      className="salon-dash-agenda-gap flex w-full items-center gap-[var(--space-3)] rounded-2xl px-[var(--space-4)] py-[var(--space-3)] text-left"
                    >
                      <span className="w-12 shrink-0 text-xs text-[var(--text-2)]">
                        {formatGridTime(entry.gap.startMs, data.timezone)}
                      </span>
                      <span className="flex-1 text-xs text-[var(--text-2)]">{formatAgendaDuration(minutes)} frei</span>
                      <span className="text-xs font-medium text-[var(--brass)]">+ Termin</span>
                    </button>
                  </li>
                );
              }

              const appointment = entry.appointment;
              const cancelled = appointment.status === "cancelled";
              return (
                <DashboardRowCard
                  key={appointment.id}
                  onClick={() => onSelectAppointment(appointment)}
                  avatar={initials(appointment.customerName ?? "?")}
                  title={
                    <span className={cancelled ? "line-through opacity-60" : undefined}>
                      {appointment.customerName ?? "Laufkundschaft"}
                    </span>
                  }
                  subtitle={appointment.serviceName}
                  badges={
                    <>
                      <StatusDot
                        label={appointmentStatusLabel(appointment.status)}
                        tone={appointment.source === "walk_in" ? "barber" : "owner"}
                      />
                    </>
                  }
                  trailing={
                    <div className={cancelled ? "opacity-60" : undefined}>
                      <div className="text-data text-sm text-[var(--text-0)]">
                        {formatGridTime(new Date(appointment.startsAt).getTime(), data.timezone)}
                      </div>
                      <div className="text-xs text-[var(--text-2)]">
                        {formatAgendaDuration(minutesBetween(new Date(appointment.startsAt).getTime(), new Date(appointment.endsAt).getTime()))}
                      </div>
                    </div>
                  }
                />
              );
            })}
          </DashboardRowList>
        )}
      </div>
    </div>
  );
}
