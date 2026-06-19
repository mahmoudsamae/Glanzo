import { TZDate } from "@date-fns/tz";

export type SlotPeriod = "morning" | "afternoon" | "evening";

export type GroupedSlots<T extends { startsAt: string }> = {
  period: SlotPeriod;
  label: string;
  slots: T[];
};

const PERIOD_LABELS: Record<SlotPeriod, string> = {
  morning: "Vormittag",
  afternoon: "Nachmittag",
  evening: "Abend",
};

function slotPeriodForHour(hour: number): SlotPeriod {
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  return "evening";
}

/** Group ISO slot timestamps into morning / afternoon / evening buckets (shop timezone). */
export function groupSlotsByPeriod<T extends { startsAt: string }>(
  slots: T[],
  timezone: string,
): GroupedSlots<T>[] {
  const buckets = new Map<SlotPeriod, T[]>();

  for (const slot of slots) {
    const hour = new TZDate(slot.startsAt, timezone).getHours();
    const period = slotPeriodForHour(hour);
    const list = buckets.get(period) ?? [];
    list.push(slot);
    buckets.set(period, list);
  }

  return (["morning", "afternoon", "evening"] as const)
    .filter((period) => (buckets.get(period)?.length ?? 0) > 0)
    .map((period) => ({
      period,
      label: PERIOD_LABELS[period],
      slots: buckets.get(period) ?? [],
    }));
}
