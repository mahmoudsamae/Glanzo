"use client";

import { useQuery } from "@tanstack/react-query";

import { CALENDAR_POLL_INTERVAL_MS, TODAY_POLL_INTERVAL_MS } from "@/lib/query/client-config";
import type { DayAppointmentsPayload, TodaySummary } from "@/server/modules/appointments/appointments.types";

import {
  fetchDayAppointmentsAction,
  fetchTodaySummaryAction,
  fetchWeekAppointmentsAction,
} from "../api";
import { appointmentsDayKey, appointmentsWeekKey, todayKey } from "../keys";

export function useDayAppointmentsQuery(
  shopId: string,
  date: string,
  barberId?: string | null,
) {
  return useQuery({
    queryKey: appointmentsDayKey(shopId, { date, barberId }),
    queryFn: async () => {
      const result = await fetchDayAppointmentsAction({ date, barberId });
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result.data;
    },
    refetchInterval: CALENDAR_POLL_INTERVAL_MS,
  });
}

export function useWeekAppointmentsQuery(
  shopId: string,
  anchorDate: string,
  barberId?: string | null,
) {
  return useQuery({
    queryKey: appointmentsWeekKey(shopId, { anchorDate, barberId }),
    queryFn: async () => {
      const result = await fetchWeekAppointmentsAction({ anchorDate, barberId });
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result.data;
    },
    refetchInterval: CALENDAR_POLL_INTERVAL_MS,
  });
}

export function useTodayQuery(shopId: string, date: string) {
  return useQuery({
    queryKey: todayKey(shopId, date),
    queryFn: async () => {
      const result = await fetchTodaySummaryAction({ date });
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result.data;
    },
    refetchInterval: TODAY_POLL_INTERVAL_MS,
  });
}

export type { DayAppointmentsPayload, TodaySummary };
