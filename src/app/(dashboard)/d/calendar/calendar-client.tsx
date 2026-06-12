"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ToastBanner } from "@/components/shared/toast-banner.client";
import { CalendarShell, parseCalendarSearchParams } from "@/features/calendar";
import {
  createWalkInAppointmentAction,
  updateAppointmentStatusAction,
  useDayAppointmentsQuery,
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
  services,
  serviceBarbers,
}: CalendarClientProps) {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  const urlState = useMemo(
    () =>
      parseCalendarSearchParams(
        Object.fromEntries(searchParams.entries()),
        { date: initialDate, view: initialView, barber: initialBarberId },
      ),
    [searchParams, initialDate, initialView, initialBarberId],
  );

  const barberFilter = role === "barber" ? undefined : urlState.barber ?? null;

  const dayQuery = useDayAppointmentsQuery(shopId, urlState.date, barberFilter);
  const weekQuery = useWeekAppointmentsQuery(shopId, urlState.date, barberFilter);
  const activeQuery = urlState.view === "week" ? weekQuery : dayQuery;

  const moveMutation = useMoveAppointmentMutation(
    shopId,
    urlState.date,
    barberFilter,
    (code) => {
      setToast(
        isBookingErrorCode(code) ? bookingErrorMessage(code) : `Move failed: ${code}`,
      );
    },
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
      await activeQuery.refetch();
      return { ok: true };
    },
    [activeQuery],
  );

  return (
    <>
      <CalendarShell
        role={role}
        actorMembershipId={actorMembershipId}
        shopSlug={shopSlug}
        initialDate={initialDate}
        initialView={initialView}
        initialBarberId={initialBarberId}
        services={services}
        serviceBarbers={serviceBarbers}
        data={activeQuery.data}
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        onRefetch={() => void activeQuery.refetch()}
        onStatusUpdate={handleStatusUpdate}
        onMoveAppointment={handleMove}
        movePending={moveMutation.isPending}
        onCreateWalkIn={handleCreateWalkIn}
      />
      <ToastBanner message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
