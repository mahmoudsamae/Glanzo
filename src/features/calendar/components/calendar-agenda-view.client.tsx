"use client";

import { useMemo, useState } from "react";

import {
  DashboardBadge,
  DashboardRowCard,
  DashboardRowList,
  DashboardStatChip,
} from "@/components/dashboard";
import type { NavRole } from "@/components/layout/nav";
import { StatusDot } from "@/components/shared/status-dot";
import { Input } from "@/components/ui/input";
import { appointmentStatusLabel } from "@/lib/appointments/status-label";
import { formatShopTodayParts } from "@/lib/dashboard/format-shop-date";
import { shopLocalInstant, shopLocalNoon } from "@/lib/datetime/shop-local";
import { cn, initials } from "@/lib/utils";
import type {
  AppointmentListItem,
  DayAppointmentsPayload,
} from "@/server/modules/appointments/appointments.types";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";

import { buildAgendaEntries, type AgendaEntry } from "../agenda-entries";
import { computeAgendaSummary } from "../agenda-summary";
import { computeGaps, minutesBetween, shopDayWindow } from "../grid";
import { horizonDates } from "../horizon";
import {
  barberInitial,
  formatAgendaCountdown,
  formatAgendaDuration,
  formatGridTime,
} from "../utils";
import { CalendarDayPicker } from "./calendar-day-picker.client";

type CalendarAgendaViewProps = {
  role: NavRole;
  data: DayAppointmentsPayload;
  weekAppointments: AppointmentListItem[];
  horizonStartDate: string;
  now: Date;
  onDateChange: (date: string) => void;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
  onOpenWalkIn: () => void;
};

function splitByBoundary(
  appointments: AppointmentListItem[],
  boundaryMs: number,
): [AppointmentListItem[], AppointmentListItem[]] {
  const first: AppointmentListItem[] = [];
  const second: AppointmentListItem[] = [];
  for (const appointment of appointments) {
    const startMs = new Date(appointment.startsAt).getTime();
    (startMs < boundaryMs ? first : second).push(appointment);
  }
  return [first, second];
}

function matchesQuery(appointment: AppointmentListItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return (
    (appointment.customerName ?? "").toLowerCase().includes(needle) ||
    appointment.serviceName.toLowerCase().includes(needle)
  );
}

type AgendaColumnProps = {
  label: string;
  hint: string;
  entries: AgendaEntry[];
  barbersById: Map<string, string>;
  timezone: string;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
  onOpenWalkIn: () => void;
};

function AgendaColumn({
  label,
  hint,
  entries,
  barbersById,
  timezone,
  onSelectAppointment,
  onOpenWalkIn,
}: AgendaColumnProps) {
  return (
    <div className="salon-dash-panel flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-[var(--space-3)] border-b border-[color:color-mix(in_oklch,var(--brass)_10%,var(--ink-3))] px-[var(--space-4)] py-[var(--space-3)]">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-0)]">{label}</p>
          <p className="mt-px truncate text-xs text-[var(--text-2)]">{hint}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-[var(--space-3)]">
        {entries.length === 0 ? (
          <div className="salon-dash-agenda-gap rounded-2xl px-[var(--space-3)] py-[var(--space-6)] text-center">
            <p className="text-sm font-medium text-[var(--text-0)]">Frei</p>
            <button
              type="button"
              onClick={onOpenWalkIn}
              className="mt-[var(--space-1)] text-xs font-medium text-[var(--brass)]"
            >
              Termin hinzufügen
            </button>
          </div>
        ) : (
          <DashboardRowList>
            {entries.map((entry) => {
              if (entry.kind === "gap") {
                const minutes = minutesBetween(entry.gap.startMs, entry.gap.endMs);
                return (
                  <li key={`gap-${entry.startMs}`} className="list-none">
                    <button
                      type="button"
                      onClick={onOpenWalkIn}
                      className="salon-dash-agenda-gap flex w-full items-center gap-[var(--space-3)] rounded-2xl px-[var(--space-3)] py-[var(--space-2)] text-left"
                    >
                      <span className="text-xs text-[var(--text-2)]">
                        {formatGridTime(entry.gap.startMs, timezone)}
                      </span>
                      <span className="flex-1 text-xs text-[var(--text-2)]">
                        {formatAgendaDuration(minutes)} frei
                      </span>
                      <span className="text-xs font-medium text-[var(--brass)]">+ Termin</span>
                    </button>
                  </li>
                );
              }

              const appointment = entry.appointment;
              const cancelled = appointment.status === "cancelled";
              const barberName = barbersById.get(appointment.membershipId) ?? "";
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
                      {barberName ? (
                        <DashboardBadge>{barberInitial(barberName)} {barberName}</DashboardBadge>
                      ) : null}
                    </>
                  }
                  trailing={
                    <div className={cancelled ? "opacity-60" : undefined}>
                      <div className="text-data text-sm text-[var(--text-0)]">
                        {formatGridTime(new Date(appointment.startsAt).getTime(), timezone)}
                      </div>
                      <div className="text-xs text-[var(--text-2)]">
                        {formatAgendaDuration(
                          minutesBetween(
                            new Date(appointment.startsAt).getTime(),
                            new Date(appointment.endsAt).getTime(),
                          ),
                        )}
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

export function CalendarAgendaView({
  data,
  weekAppointments,
  horizonStartDate,
  now,
  onDateChange,
  onSelectAppointment,
  onOpenWalkIn,
}: CalendarAgendaViewProps) {
  const [query, setQuery] = useState("");
  const nowMs = now.getTime();

  const window = useMemo(
    () => shopDayWindow(data.date, data.timezone, data.openingHours),
    [data.date, data.timezone, data.openingHours],
  );

  const { upcoming, active } = useMemo(
    () => computeAgendaSummary(data.appointments, nowMs),
    [data.appointments, nowMs],
  );

  const barbersById = useMemo(
    () => new Map(data.barbers.map((barber) => [barber.membershipId, barber.displayName])),
    [data.barbers],
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

  const splitBoundaryMs = shopLocalInstant(data.date, "13:00", data.timezone);
  const [allFirst, allSecond] = splitByBoundary(data.appointments, splitBoundaryMs);
  const filteredAppointments = data.appointments.filter((appointment) => matchesQuery(appointment, query));
  const [filteredFirst, filteredSecond] = splitByBoundary(filteredAppointments, splitBoundaryMs);

  const windowBoundaryMs = window
    ? Math.min(Math.max(splitBoundaryMs, window.startMs), window.endMs)
    : splitBoundaryMs;
  const firstWindow = window ? { startMs: window.startMs, endMs: windowBoundaryMs } : null;
  const secondWindow = window ? { startMs: windowBoundaryMs, endMs: window.endMs } : null;

  const firstGaps = firstWindow ? computeGaps(allFirst, firstWindow) : [];
  const secondGaps = secondWindow ? computeGaps(allSecond, secondWindow) : [];
  const gapCount = firstGaps.length + secondGaps.length;

  const firstEntries = buildAgendaEntries(filteredFirst, firstGaps);
  const secondEntries = buildAgendaEntries(filteredSecond, secondGaps);

  const firstActive = allFirst.filter((appointment) => appointment.status !== "cancelled");
  const secondActive = allSecond.filter((appointment) => appointment.status !== "cancelled");

  return (
    <div className="flex flex-1 flex-col gap-[var(--space-4)] overflow-hidden px-[var(--space-4)] py-[var(--space-4)] lg:px-[var(--space-8)]">
      <header className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
          <div>
            <p className="salon-dash-kicker text-xs">{monthYearKicker}</p>
            <p className="mt-[var(--space-1)] font-display text-2xl text-[var(--text-0)]">
              {isToday ? "Heute" : weekday}, {day}. {month}
            </p>
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kunde oder Leistung suchen"
            className="salon-dash-search w-full max-w-xs"
          />
        </div>
        <CalendarDayPicker
          weekDates={weekDates}
          timezone={data.timezone}
          activeDate={data.date}
          countsByDate={countsByDate}
          onDateChange={onDateChange}
        />
      </header>

      <div className="flex flex-wrap items-stretch gap-[var(--space-3)]">
        {upcoming ? (
          <div className="flex flex-1 min-w-[280px] items-center gap-[var(--space-4)] rounded-2xl border border-[color:color-mix(in_oklch,var(--brass)_16%,var(--ink-3))] bg-[linear-gradient(120deg,color-mix(in_oklch,var(--brass)_15%,transparent),color-mix(in_oklch,var(--brass)_3%,transparent))] px-[var(--space-5)] py-[var(--space-4)]">
            <div className="min-w-[74px] text-2xl font-bold text-[var(--brass)]">
              {formatGridTime(new Date(upcoming.startsAt).getTime(), data.timezone)}
            </div>
            <div className="h-full w-px self-stretch bg-[color:color-mix(in_oklch,var(--brass)_20%,transparent)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--text-2)]">
                Nächster Termin · {formatAgendaCountdown(new Date(upcoming.startsAt).getTime(), nowMs)}
              </p>
              <p className="mt-[var(--space-1)] truncate text-sm font-semibold text-[var(--text-0)]">
                {upcoming.customerName ?? "Laufkundschaft"}
              </p>
              <p className="mt-px truncate text-xs text-[var(--text-2)]">{upcoming.serviceName}</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-[var(--space-6)] rounded-2xl border border-[color:color-mix(in_oklch,var(--brass)_10%,var(--ink-3))] bg-[var(--ink-1)] px-[var(--space-5)] py-[var(--space-4)]">
          <DashboardStatChip label="Termine" value={active.length} />
          <DashboardStatChip label="Lücken" value={gapCount} />
        </div>
      </div>

      {window ? (
        <div className="flex min-h-0 flex-1 gap-[var(--space-3)]">
          <AgendaColumn
            label="Vormittag"
            hint={`bis 13:00 · ${firstActive.length} Termine`}
            entries={firstEntries}
            barbersById={barbersById}
            timezone={data.timezone}
            onSelectAppointment={onSelectAppointment}
            onOpenWalkIn={onOpenWalkIn}
          />
          <AgendaColumn
            label="Nachmittag & Abend"
            hint={`ab 13:00 · ${secondActive.length} Termine`}
            entries={secondEntries}
            barbersById={barbersById}
            timezone={data.timezone}
            onSelectAppointment={onSelectAppointment}
            onOpenWalkIn={onOpenWalkIn}
          />
        </div>
      ) : (
        <p className={cn("py-[var(--space-8)] text-center text-muted-foreground")}>
          Shop an diesem Tag geschlossen.
        </p>
      )}
    </div>
  );
}
