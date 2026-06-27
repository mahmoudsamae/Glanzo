"use client";

import { addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { shopLocalNoon } from "@/lib/datetime/shop-local";
import { formatShopTodayParts } from "@/lib/dashboard/format-shop-date";
import type { BarberColumn } from "@/server/modules/appointments/appointments.types";
import type { NavRole } from "@/components/layout/nav";

type CalendarToolbarProps = {
  date: string;
  timezone: string;
  view: "day" | "week";
  barberId?: string;
  barbers: BarberColumn[];
  role: NavRole;
  showCancelled: boolean;
  onDateChange: (date: string) => void;
  onViewChange: (view: "day" | "week") => void;
  onBarberChange: (barberId: string) => void;
  onToggleCancelled: () => void;
};

function shiftIsoDate(date: string, days: number, timezone: string): string {
  const anchor = shopLocalNoon(date, timezone);
  const shifted = addDays(anchor, days);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarToolbar({
  date,
  timezone,
  view,
  barberId,
  barbers,
  role,
  showCancelled,
  onDateChange,
  onViewChange,
  onBarberChange,
  onToggleCancelled,
}: CalendarToolbarProps) {
  const { weekday, day, month } = formatShopTodayParts(timezone, shopLocalNoon(date, timezone));

  return (
    <header className="flex shrink-0 flex-col gap-[var(--space-3)] border-b border-border px-[var(--space-4)] py-[var(--space-4)] lg:px-[var(--space-8)]">
      <div className="flex items-center justify-between gap-[var(--space-2)]">
        <div>
          <p className="text-base text-[var(--text-2)]">
            {weekday},{" "}
            <span className="text-data text-[var(--text-1)]">{day}</span> {month}
          </p>
        </div>
        <div className="flex items-center gap-[var(--space-1)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDateChange(shiftIsoDate(date, -1, timezone))}
          >
            Zurück
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDateChange(shiftIsoDate(date, 1, timezone))}
          >
            Weiter
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
        <div className="flex gap-[var(--space-1)]">
          <Button
            type="button"
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("day")}
          >
            Tag
          </Button>
          <Button
            type="button"
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("week")}
          >
            Woche
          </Button>
        </div>

        {view === "week" && role === "owner" && barbers.length > 1 ? (
          <select
            className="rounded-sm border border-border bg-transparent px-[var(--space-2)] py-[var(--space-1)] text-sm"
            value={barberId ?? barbers[0]?.membershipId ?? ""}
            onChange={(event) => onBarberChange(event.target.value)}
          >
            {barbers.map((barber) => (
              <option key={barber.membershipId} value={barber.membershipId}>
                {barber.displayName}
              </option>
            ))}
          </select>
        ) : null}

        <Button type="button" variant="ghost" size="sm" onClick={onToggleCancelled}>
          {showCancelled ? "Stornierte ausblenden" : "Stornierte anzeigen"}
        </Button>
      </div>
    </header>
  );
}
