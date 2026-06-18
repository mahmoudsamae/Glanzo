"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CutLine } from "@/components/shared/cut-line";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricNumber } from "@/components/shared/metric-number.client";
import { StatusDot } from "@/components/shared/status-dot";
import {
  DashboardMetricTile,
  DashboardPage,
  DashboardPanel,
  DashboardRowCard,
  DashboardRowList,
} from "@/features/dashboard";
import { useNow } from "@/hooks/use-now";
import { filterNewLandingIds, mergeSeenIds } from "@/lib/appointments/lands-animation";
import { appointmentStatusLabel } from "@/lib/appointments/status-label";
import { formatShopTodayParts } from "@/lib/dashboard/format-shop-date";
import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";
import {
  formatTodaySubline,
  workingDayProgress,
} from "@/server/modules/appointments/today-summary";
import type { OpeningHours } from "@/lib/validations/shop";
import { cn } from "@/lib/utils";

import { TodaySkeleton } from "./today-skeleton";

type TodayPayload = {
  expectedRevenueCents: number;
  appointmentCount: number;
  gapCount: number;
  noShowCount: number;
  appointments: AppointmentListItem[];
  timezone: string;
  openingHours: OpeningHours;
};

type TodayShellProps = {
  date: string;
  timezone: string;
  openingHours: OpeningHours;
  data: TodayPayload | undefined;
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
};

function formatRowTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(iso));
}

export function TodayShell({
  date,
  timezone,
  openingHours,
  data,
  isLoading,
  isError,
  onRefetch,
  onSelectAppointment,
}: TodayShellProps) {
  const now = useNow();
  const router = useRouter();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [landingIds, setLandingIds] = useState<Set<string>>(() => new Set());

  const appointmentIds = useMemo(
    () => (data?.appointments ?? []).map((appointment) => appointment.id),
    [data?.appointments],
  );

  useEffect(() => {
    const fresh = filterNewLandingIds(seenIdsRef.current, appointmentIds);
    if (fresh.length === 0) {
      return;
    }
    seenIdsRef.current = mergeSeenIds(seenIdsRef.current, fresh);
    setLandingIds((current) => {
      const next = new Set(current);
      for (const id of fresh) {
        next.add(id);
      }
      return next;
    });
    const timer = window.setTimeout(() => {
      setLandingIds((current) => {
        const next = new Set(current);
        for (const id of fresh) {
          next.delete(id);
        }
        return next;
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [appointmentIds]);

  const { weekday, day, month } = formatShopTodayParts(timezone, now);
  const progress = workingDayProgress(openingHours, date, timezone, now);

  if (isLoading && !data) {
    return <TodaySkeleton />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Today unavailable"
        actionLabel="Try again"
        onAction={onRefetch}
      />
    );
  }

  const subline = formatTodaySubline(data);
  const active = data.appointments.filter((apt) => apt.status !== "cancelled");

  return (
    <DashboardPage width="lg">
      <header className="dash-today-header max-w-xl">
        <p className="salon-dash-kicker text-xs">Today</p>
        <p className="mt-[var(--space-2)] text-base text-[var(--text-2)]">
          {weekday},{" "}
          <span className="text-data text-[var(--text-1)]">{day}</span> {month}
        </p>
        <div className="mt-[var(--space-4)]">
          <CutLine progress={progress} />
        </div>
      </header>

      <div className="mt-[var(--space-8)] grid max-w-3xl gap-[var(--space-3)] sm:grid-cols-2">
        <div className="salon-dash-hero-metric sm:col-span-2">
          <span className="dash-metric-settle inline-block">
            <MetricNumber
              value={data.expectedRevenueCents}
              format={(cents) => `€${(cents / 100).toFixed(2)}`}
              className="font-display text-[64px] leading-none text-data text-[var(--text-0)]"
            />
          </span>
          {subline ? (
            <p className="mt-[var(--space-2)] text-base text-[var(--text-2)]">{subline}</p>
          ) : null}
        </div>
        <DashboardMetricTile label="Bookings" value={data.appointmentCount} hint="On today's calendar" />
        <DashboardMetricTile label="Open gaps" value={data.gapCount} hint="Slots between appointments" />
        <DashboardMetricTile label="No-shows" value={data.noShowCount} hint="Marked today" />
      </div>

      {active.length === 0 ? (
        <div className="mt-[var(--space-8)] max-w-xl">
          <EmptyState
            title="A quiet morning."
            actionLabel="Add walk-in"
            onAction={() => router.push("/d/calendar")}
          />
        </div>
      ) : (
        <DashboardPanel
          title="Today's chair"
          description={`${active.length} booking${active.length === 1 ? "" : "s"} on the books`}
          className="mt-[var(--space-8)] max-w-2xl"
        >
          <DashboardRowList>
            {data.appointments.map((appointment) => {
              const past = now.getTime() > new Date(appointment.endsAt).getTime();
              return (
                <DashboardRowCard
                  key={appointment.id}
                  onClick={() => onSelectAppointment(appointment)}
                  avatar={formatRowTime(appointment.startsAt, timezone)}
                  title={appointment.customerName ?? "Walk-in"}
                  subtitle={appointment.serviceName}
                  badges={<StatusDot label={appointmentStatusLabel(appointment.status)} />}
                  trailing={
                    <span className={cn("text-sm tabular-nums", past ? "text-[var(--text-2)]" : "text-[var(--text-0)]")}>
                      {past ? "Done" : "Up next"}
                    </span>
                  }
                />
              );
            })}
          </DashboardRowList>
        </DashboardPanel>
      )}
    </DashboardPage>
  );
}
