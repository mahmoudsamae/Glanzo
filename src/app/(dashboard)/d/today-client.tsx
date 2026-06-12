"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { useNow } from "@/hooks/use-now";

import { TodayShell } from "@/features/today";
import {
  updateAppointmentStatusAction,
  useMoveAppointmentMutation,
  useTodayQuery,
} from "@/features/appointments";
import type { AppointmentListItem } from "@/server/modules/appointments/appointments.types";
import type { NavRole } from "@/components/layout/nav";
import { ToastBanner } from "@/components/shared/toast-banner.client";
import { bookingErrorMessage, isBookingErrorCode } from "@/lib/booking/errors";
import type { OpeningHours } from "@/lib/validations/shop";

const AppointmentDetailSheet = dynamic(
  () =>
    import("@/features/calendar/components/appointment-detail-sheet.client").then(
      (mod) => mod.AppointmentDetailSheet,
    ),
  { ssr: false },
);

type TodayClientProps = {
  shopId: string;
  shopSlug: string;
  date: string;
  timezone: string;
  openingHours: OpeningHours;
  role: NavRole;
  actorMembershipId: string;
  barberDisplayNames: Array<{ membershipId: string; displayName: string }>;
};

export function TodayClient({
  shopId,
  shopSlug,
  date,
  timezone,
  openingHours,
  role,
  actorMembershipId,
  barberDisplayNames,
}: TodayClientProps) {
  const now = useNow();
  const [selected, setSelected] = useState<AppointmentListItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useTodayQuery(shopId, date);

  const moveMutation = useMoveAppointmentMutation(shopId, date, null, (code) => {
    setToast(
      isBookingErrorCode(code) ? bookingErrorMessage(code) : `Move failed: ${code}`,
    );
  });

  const handleStatusUpdate = useCallback(
    async (input: { appointmentId: string; status: "completed" | "no_show" | "cancelled" }) => {
      const result = await updateAppointmentStatusAction(input);
      return { ok: result.ok };
    },
    [],
  );

  return (
    <>
      <TodayShell
        date={date}
        timezone={timezone}
        openingHours={openingHours}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRefetch={() => void refetch()}
        onSelectAppointment={setSelected}
      />
      {data && selected ? (
        <AppointmentDetailSheet
          appointment={selected}
          timezone={data.timezone}
          role={role}
          actorMembershipId={actorMembershipId}
          shopSlug={shopSlug}
          barbers={barberDisplayNames.map((barber) => ({
            membershipId: barber.membershipId,
            displayName: barber.displayName,
            role: "barber" as const,
          }))}
          nowMs={now.getTime()}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          onUpdated={() => void refetch()}
          onMoveAppointment={(input) => moveMutation.mutate(input)}
          movePending={moveMutation.isPending}
        />
      ) : null}
      <ToastBanner message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
