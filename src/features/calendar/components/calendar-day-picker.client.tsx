"use client";

import { shopLocalNoon } from "@/lib/datetime/shop-local";
import { cn } from "@/lib/utils";

import { formatWeekdayLabel } from "../grid";

type CalendarDayPickerProps = {
  weekDates: string[];
  timezone: string;
  activeDate: string;
  countsByDate: Map<string, number>;
  onDateChange: (date: string) => void;
  className?: string;
};

/** 14-day chip grid: 7 per row, wraps to a second line on every screen. */
export function CalendarDayPicker({
  weekDates,
  timezone,
  activeDate,
  countsByDate,
  onDateChange,
  className,
}: CalendarDayPickerProps) {
  return (
    <div
      data-day-picker
      className={cn(
        "grid w-full grid-cols-7 gap-[var(--space-2)]",
        className,
      )}
    >
      {weekDates.map((weekDate) => {
        const isActive = weekDate === activeDate;
        const count = countsByDate.get(weekDate) ?? 0;
        const noon = shopLocalNoon(weekDate, timezone);
        const dayNumber = noon.getDate();
        return (
          <button
            key={weekDate}
            type="button"
            onClick={() => onDateChange(weekDate)}
            className={cn(
              "salon-dash-day-chip flex min-w-0 w-full flex-col items-center gap-[var(--space-1)] rounded-2xl px-0 py-[var(--space-2)] text-center",
              isActive ? "salon-dash-day-chip--active text-[var(--ink-0)]" : "text-[var(--text-1)]",
            )}
          >
            <span
              className={cn(
                "text-[10px] tracking-wide",
                isActive ? "text-[var(--ink-0)]/75" : "text-[var(--text-2)]",
              )}
            >
              {formatWeekdayLabel(weekDate, timezone).toUpperCase()}
            </span>
            <span className="text-sm font-semibold sm:text-base">{dayNumber}</span>
            <span
              className={cn(
                "size-1 rounded-full",
                count > 0 ? (isActive ? "bg-[var(--ink-0)]/55" : "bg-[var(--brass)]") : "bg-transparent",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
