"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { CutLine } from "@/components/shared/cut-line";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricNumber } from "@/components/shared/metric-number.client";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import {
  DashboardMetricTile,
  DashboardPage,
  DashboardPanel,
  DashboardRowCard,
  DashboardRowList,
} from "@/components/dashboard";
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
  isRefreshing?: boolean;
  showRevenue?: boolean;
  onRefetch: () => void;
  onSelectAppointment: (appointment: AppointmentListItem) => void;
};

function formatRowTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
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
  isRefreshing = false,
  showRevenue = true,
  onRefetch,
  onSelectAppointment,
}: TodayShellProps) {
  const now = useNow();
  const router = useRouter();
  const seenIdsRef = useRef<Set<string>>(new Set());

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
  }, [appointmentIds]);

  const { weekday, day, month } = formatShopTodayParts(timezone, now);
  const progress = workingDayProgress(openingHours, date, timezone, now);

  if (isLoading && !data) {
    return <TodaySkeleton />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Heute nicht verfügbar"
        actionLabel="Erneut versuchen"
        onAction={onRefetch}
      />
    );
  }

  const subline = formatTodaySubline(data);
  const active = data.appointments.filter((apt) => apt.status !== "cancelled");

  return (
    <DashboardPage width="lg">
      <header className="dash-today-header max-w-xl">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div>
            <p className="salon-dash-kicker text-xs">Heute</p>
            <p className="mt-[var(--space-2)] text-base text-[var(--text-2)]">
              {weekday},{" "}
              <span className="text-data text-[var(--text-1)]">{day}</span> {month}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="salon-dash-btn-outline shrink-0"
            disabled={isRefreshing}
            onClick={onRefetch}
            aria-label="Heute aktualisieren"
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
            Aktualisieren
          </Button>
        </div>
        <div className="mt-[var(--space-4)]">
          <CutLine progress={progress} />
        </div>
      </header>

      <div className="mt-[var(--space-8)] grid max-w-3xl gap-[var(--space-3)] sm:grid-cols-2">
        {showRevenue ? (
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
        ) : (
          <div className="salon-dash-hero-metric sm:col-span-2">
            <p className="font-display text-[2rem] leading-tight text-[var(--text-0)]">
              {data.appointmentCount} Termin{data.appointmentCount === 1 ? "" : "e"}
            </p>
            {subline ? (
              <p className="mt-[var(--space-2)] text-base text-[var(--text-2)]">{subline}</p>
            ) : null}
          </div>
        )}
        <DashboardMetricTile label="Termine" value={data.appointmentCount} hint="Im heutigen Kalender" />
        <DashboardMetricTile label="Freie Lücken" value={data.gapCount} hint="Zwischen Terminen" />
        <DashboardMetricTile label="No-Shows" value={data.noShowCount} hint="Heute markiert" />
      </div>

      {active.length === 0 ? (
        <div className="mt-[var(--space-8)] max-w-xl">
          <EmptyState
            title="Ein ruhiger Morgen."
            actionLabel="Laufkundschaft"
            onAction={() => router.push("/d/calendar")}
          />
        </div>
      ) : (
        <DashboardPanel
          title="Heutiger Stuhl"
          description={`${active.length} Termin${active.length === 1 ? "" : "e"} im Kalender`}
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
                  title={appointment.customerName ?? "Laufkundschaft"}
                  subtitle={appointment.serviceName}
                  badges={<StatusDot label={appointmentStatusLabel(appointment.status)} />}
                  trailing={
                    <span className={cn("text-sm tabular-nums", past ? "text-[var(--text-2)]" : "text-[var(--text-0)]")}>
                      {past ? "Erledigt" : "Als Nächstes"}
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
