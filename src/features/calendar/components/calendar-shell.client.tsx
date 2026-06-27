"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import type { AppointmentListItem, DayAppointmentsPayload } from "@/server/modules/appointments/appointments.types";
import type { NavRole } from "@/components/layout/nav";
import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";

import { buildCalendarSearchParams, parseCalendarSearchParams } from "../url-state";
import { filterNewLandingIds, mergeSeenIds } from "@/lib/appointments/lands-animation";
import { CalendarSkeleton } from "./calendar-skeleton";
import { CalendarToolbar } from "./calendar-toolbar.client";

const AppointmentDetailSheet = dynamic(
  () =>
    import("./appointment-detail-sheet.client").then((mod) => mod.AppointmentDetailSheet),
  { ssr: false },
);

const WalkInSheet = dynamic(
  () => import("./walk-in-sheet.client").then((mod) => mod.WalkInSheet),
  { ssr: false },
);

const CalendarDayGrid = dynamic(
  () => import("./calendar-day-grid.client").then((mod) => mod.CalendarDayGrid),
  { ssr: false, loading: () => <CalendarSkeleton /> },
);

const CalendarWeekGrid = dynamic(
  () => import("./calendar-week-grid.client").then((mod) => mod.CalendarWeekGrid),
  { ssr: false, loading: () => <CalendarSkeleton /> },
);

type StatusUpdateInput = {
  appointmentId: string;
  status: "completed" | "no_show" | "cancelled";
};

type CalendarShellProps = {
  role: NavRole;
  actorMembershipId: string;
  shopSlug: string;
  initialDate: string;
  initialView: "day" | "week";
  initialBarberId?: string;
  services: ServiceCatalogItem[];
  serviceBarbers: BarberOption[];
  data: DayAppointmentsPayload | undefined;
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  onStatusUpdate: (input: StatusUpdateInput) => Promise<{ ok: boolean }>;
  onMoveAppointment: (input: {
    appointmentId: string;
    startsAt: string;
    membershipId?: string;
  }) => void;
  movePending?: boolean;
  onCreateWalkIn: (input: {
    serviceId: string;
    membershipId: string;
    startsAt: string;
    name?: string;
    phone?: string;
  }) => Promise<{ ok: boolean; code?: string }>;
};

export function CalendarShell({
  role,
  actorMembershipId,
  shopSlug,
  initialDate,
  initialView,
  initialBarberId,
  services,
  serviceBarbers,
  data,
  isLoading,
  isError,
  onRefetch,
  onStatusUpdate,
  onMoveAppointment,
  movePending = false,
  onCreateWalkIn,
}: CalendarShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = useNow();
  const [selected, setSelected] = useState<AppointmentListItem | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [landingIds, setLandingIds] = useState<Set<string>>(() => new Set());

  const urlState = useMemo(
    () =>
      parseCalendarSearchParams(
        Object.fromEntries(searchParams.entries()),
        { date: initialDate, view: initialView, barber: initialBarberId },
      ),
    [searchParams, initialDate, initialView, initialBarberId],
  );

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

  const setUrl = useCallback(
    (patch: Partial<{ date: string; view: "day" | "week"; barber?: string | null }>) => {
      const qs = buildCalendarSearchParams({
        date: patch.date ?? urlState.date,
        view: patch.view ?? urlState.view,
        barber: patch.barber !== undefined ? patch.barber : urlState.barber,
      });
      router.replace(`/d/calendar?${qs}`);
    },
    [router, urlState.barber, urlState.date, urlState.view],
  );

  if (isLoading && !data) {
    return <CalendarSkeleton />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Kalender nicht verfügbar"
        description="Termine für diesen Tag konnten nicht geladen werden."
        actionLabel="Erneut versuchen"
        onAction={onRefetch}
      />
    );
  }

  const activeAppointments = data.appointments.filter(
    (appointment) => appointment.status !== "cancelled",
  );
  const weekBarber =
    data.barbers.find((barber) => barber.membershipId === urlState.barber) ??
    data.barbers[0];

  const showEmptyDay =
    urlState.view === "day" && activeAppointments.length === 0 && !showCancelled;

  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col lg:min-h-[100dvh]">
      <CalendarToolbar
        date={urlState.date}
        timezone={data.timezone}
        view={urlState.view}
        barberId={urlState.barber}
        barbers={data.barbers}
        role={role}
        showCancelled={showCancelled}
        onDateChange={(date) => setUrl({ date })}
        onViewChange={(view) => setUrl({ view })}
        onBarberChange={(barber) => setUrl({ barber })}
        onToggleCancelled={() => setShowCancelled((value) => !value)}
      />

      {showEmptyDay ? (
        <EmptyState
          title="Keine Termine an diesem Tag."
          actionLabel="Laufkundschaft"
          onAction={() => setWalkInOpen(true)}
        />
      ) : urlState.view === "week" && weekBarber ? (
        <CalendarWeekGrid
          anchorDate={urlState.date}
          timezone={data.timezone}
          openingHours={data.openingHours}
          barber={weekBarber}
          appointments={data.appointments}
          slotGranularityMin={data.slotGranularityMin}
          nowMs={now.getTime()}
          role={role}
          actorMembershipId={actorMembershipId}
          landingIds={landingIds}
          showCancelled={showCancelled}
          onSelectAppointment={setSelected}
          onMoveAppointment={onMoveAppointment}
        />
      ) : (
        <CalendarDayGrid
          date={urlState.date}
          timezone={data.timezone}
          openingHours={data.openingHours}
          barbers={data.barbers}
          appointments={data.appointments}
          slotGranularityMin={data.slotGranularityMin}
          nowMs={now.getTime()}
          showCancelled={showCancelled}
          landingIds={landingIds}
          role={role}
          actorMembershipId={actorMembershipId}
          onSelectAppointment={setSelected}
          onMoveAppointment={onMoveAppointment}
        />
      )}

      <Button
        type="button"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px)+var(--space-4))] right-[var(--space-4)] z-40 size-12 rounded-full bg-[var(--brass)] text-[var(--ink-0)] shadow-lg lg:bottom-[var(--space-8)] lg:right-[var(--space-8)]"
        onClick={() => setWalkInOpen(true)}
        aria-label="Laufkundschaft hinzufügen"
      >
        +
      </Button>
      <div className="hidden lg:block">
        <Button
          type="button"
          className="absolute right-[var(--space-8)] top-[var(--space-4)] z-40"
          onClick={() => setWalkInOpen(true)}
        >
          Laufkundschaft
        </Button>
      </div>

      <WalkInSheet
        open={walkInOpen}
        onOpenChange={setWalkInOpen}
        shopSlug={shopSlug}
        timezone={data.timezone}
        date={urlState.date}
        role={role}
        lockedBarberId={role === "barber" ? actorMembershipId : undefined}
        services={services}
        barbers={serviceBarbers}
        granularityMin={data.slotGranularityMin}
        onCreate={onCreateWalkIn}
      />

      <AppointmentDetailSheet
        appointment={selected}
        timezone={data.timezone}
        role={role}
        actorMembershipId={actorMembershipId}
        shopSlug={shopSlug}
        barbers={data.barbers}
        nowMs={now.getTime()}
        onClose={() => setSelected(null)}
        onStatusUpdate={onStatusUpdate}
        onUpdated={onRefetch}
        onMoveAppointment={onMoveAppointment}
        movePending={movePending}
      />

    </div>
  );
}
