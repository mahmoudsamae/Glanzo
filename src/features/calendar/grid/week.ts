import { format } from "date-fns";
import { de } from "date-fns/locale";

import { shopLocalNoon } from "@/lib/datetime/shop-local";

export { weekDatesFromAnchor } from "@/server/modules/availability/time-windows";

export function formatWeekdayLabel(date: string, timezone: string): string {
  return format(shopLocalNoon(date, timezone), "EEE", { locale: de });
}
