"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ToastBanner } from "@/components/shared/toast-banner.client";
import { CalendarShell, parseCalendarSearchParams } from "@/features/calendar";
import {
  clampDateToHorizon,
  sliceDayFromHorizon,
} from "@/features/calendar/horizon";
import {
  createWalkInAppointmentAction,
  updateAppointmentStatusAction,
  useHorizonAppointmentsQuery,
  useMoveAppointmentMutation,
  useWeekAppointmentsQuery,
} from "@/features/appointments";
import { bookingErrorMessage, isBookingErrorCode } from "@/lib/booking/errors";
import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";
import type { NavRole } from "@/components/layout/nav";

type CalendarClientProps = {
  shopId: string;
  shopSlug: string;
  role: NavRole;
  actorMembershipId: string;
  initialDate: string;
  initialView: "day" | "week";
  initialBarberId?: string;
  initialMode: "grid" | "agenda";
  services: ServiceCatalogItem[];
  serviceBarbers: BarberOption[];
};

export function CalendarClient({
  shopId,
  shopSlug,
  role,
  actorMembershipId,
  initialDate,
  initialView,
  initialBarberId,
  initialMode,
  services,
  serviceBarbers,
}: CalendarClientProps) {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);
  const horizonStartDate = initialDate;

  const urlState = useMemo(
    () =>
      parseCalendarSearchParams(
        Object.fromEntries(searchParams.entries()),
        { date: initialDate, view: initialView, barber: initialBarberId },
      ),
    [searchParams, initialDate, initialView, initialBarberId],
  );

  const selectedDate = clampDateToHorizon(urlState.date, horizonStartDate);
  const barberFilter = role === "barber" ? undefined : urlState.barber ?? null;

  const horizonQuery = useHorizonAppointmentsQuery(shopId, horizonStartDate, barberFilter);
  const weekQuery = useWeekAppointmentsQuery(
    shopId,
    selectedDate,
    barberFilter,
    urlState.view === "week",
  );
  const dayData = useMemo(
    () => (horizonQuery.data ? sliceDayFromHorizon(horizonQuery.data, selectedDate) : undefined),
    [horizonQuery.data, selectedDate],
  );
  const activeQuery = urlState.view === "week" ? weekQuery : horizonQuery;

  const moveMutation = useMoveAppointmentMutation(
    shopId,
    selectedDate,
    barberFilter,
    (code) => {
      setToast(
        isBookingErrorCode(code) ? bookingErrorMessage(code) : `Verschieben fehlgeschlagen: ${code}`,
      );
    },
    horizonStartDate,
  );

  const handleStatusUpdate = useCallback(
    async (input: { appointmentId: string; status: "completed" | "no_show" | "cancelled" }) => {
      const result = await updateAppointmentStatusAction(input);
      return { ok: result.ok };
    },
    [],
  );

  const handleMove = useCallback(
    (input: { appointmentId: string; startsAt: string; membershipId?: string }) => {
      moveMutation.mutate(input);
    },
    [moveMutation],
  );

  const handleCreateWalkIn = useCallback(
    async (input: {
      serviceId: string;
      membershipId: string;
      startsAt: string;
      name?: string;
      phone?: string;
    }) => {
      const result = await createWalkInAppointmentAction(input);
      if (!result.ok) {
        return {
          ok: false,
          code: isBookingErrorCode(result.code) ? bookingErrorMessage(result.code) : result.code,
        };
      }
      await Promise.all([horizonQuery.refetch(), weekQuery.refetch()]);
      return { ok: true };
    },
    [horizonQuery, weekQuery],
  );

  return (
    <>
      <CalendarShell
        role={role}
        actorMembershipId={actorMembershipId}
        shopSlug={shopSlug}
        initialDate={horizonStartDate}
        initialView={initialView}
        initialBarberId={initialBarberId}
        initialMode={initialMode}
        services={services}
        serviceBarbers={serviceBarbers}
        data={urlState.view === "week" ? weekQuery.data : dayData}
        dayData={dayData}
        weekAppointments={horizonQuery.data?.appointments ?? weekQuery.data?.appointments}
        horizonStartDate={horizonStartDate}
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        onRefetch={() => {
          void horizonQuery.refetch();
          void weekQuery.refetch();
        }}
        onStatusUpdate={handleStatusUpdate}
        onMoveAppointment={handleMove}
        movePending={moveMutation.isPending}
        onCreateWalkIn={handleCreateWalkIn}
      />
      <ToastBanner message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
