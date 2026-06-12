import { shopQueryKey } from "@/lib/query/keys";

/** [shopId, 'appointments', { date, barber? }] */
export function appointmentsDayKey(
  shopId: string,
  params: { date: string; barberId?: string | null },
) {
  return shopQueryKey(shopId, "appointments", params);
}

/** [shopId, 'appointments-week', { anchorDate, barber? }] */
export function appointmentsWeekKey(
  shopId: string,
  params: { anchorDate: string; barberId?: string | null },
) {
  return shopQueryKey(shopId, "appointments-week", params);
}

/** [shopId, 'today', date] */
export function todayKey(shopId: string, date: string) {
  return shopQueryKey(shopId, "today", { date });
}
