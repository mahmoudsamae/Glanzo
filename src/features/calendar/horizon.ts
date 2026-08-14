import type { AppointmentListItem, DayAppointmentsPayload } from "@/server/modules/appointments/appointments.types";
import { dateInShopTimezone } from "@/server/modules/availability/time-windows";
import { addIsoDays, datesFromStart } from "@/lib/datetime/iso-date";

export const CALENDAR_HORIZON_DAYS = 14;

export { addIsoDays, datesFromStart };

export function horizonDates(startDate: string, count = CALENDAR_HORIZON_DAYS): string[] {
  return datesFromStart(startDate, count);
}

export function isDateInHorizon(
  date: string,
  startDate: string,
  count = CALENDAR_HORIZON_DAYS,
): boolean {
  const endDate = addIsoDays(startDate, count - 1);
  return date >= startDate && date <= endDate;
}

export function clampDateToHorizon(
  date: string,
  startDate: string,
  count = CALENDAR_HORIZON_DAYS,
): string {
  return isDateInHorizon(date, startDate, count) ? date : startDate;
}

export function sliceDayFromHorizon(
  horizon: DayAppointmentsPayload,
  date: string,
): DayAppointmentsPayload {
  return {
    ...horizon,
    date,
    appointments: appointmentsOnDate(horizon.appointments, date, horizon.timezone),
  };
}

export function appointmentsOnDate(
  appointments: AppointmentListItem[],
  date: string,
  timezone: string,
): AppointmentListItem[] {
  return appointments.filter(
    (appointment) => dateInShopTimezone(new Date(appointment.startsAt), timezone) === date,
  );
}
