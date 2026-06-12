"use client";

import { useQueryClient } from "@tanstack/react-query";

import type { DayAppointmentsPayload } from "@/server/modules/appointments/appointments.types";
import type { MoveAppointmentInput } from "@/lib/validations/appointment";

import { moveAppointmentAction } from "../api";
import { appointmentsDayKey, appointmentsWeekKey } from "../keys";
import { useOptimisticAppointmentMutation } from "./use-appointment-mutation";

export function useMoveAppointmentMutation(
  shopId: string,
  date: string,
  barberId?: string | null,
  onErrorCode?: (code: string) => void,
) {
  const queryClient = useQueryClient();
  const dayKey = appointmentsDayKey(shopId, { date, barberId });
  const weekKey = appointmentsWeekKey(shopId, { anchorDate: date, barberId });

  return useOptimisticAppointmentMutation<
    MoveAppointmentInput,
    { id: string; startsAt: string; endsAt: string },
    DayAppointmentsPayload
  >({
    mutationFn: moveAppointmentAction,
    queryKeys: [dayKey, weekKey],
    getCache: (key) => queryClient.getQueryData<DayAppointmentsPayload>(key),
    setCache: (key, value) => queryClient.setQueryData(key, value),
    onOptimisticUpdate: (cache, input) => ({
      ...cache,
      appointments: cache.appointments.map((appointment) => {
        if (appointment.id !== input.appointmentId) {
          return appointment;
        }
        const durationMs =
          new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime();
        const startsAt = input.startsAt;
        const endsAt = new Date(new Date(startsAt).getTime() + durationMs).toISOString();
        return {
          ...appointment,
          startsAt,
          endsAt,
          membershipId: input.membershipId ?? appointment.membershipId,
        };
      }),
    }),
    onErrorCode,
  });
}
