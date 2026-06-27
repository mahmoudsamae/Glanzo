"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type OpeningHours,
  type WeekdayKey,
} from "@/lib/validations/shop";

type OpeningHoursEditorProps = {
  value: OpeningHours;
  onChange: (value: OpeningHours) => void;
};

export function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  function toggleDay(day: WeekdayKey, open: boolean) {
    onChange({
      ...value,
      [day]: open ? { open: "09:00", close: "19:00" } : null,
    });
  }

  function updateDayTime(day: WeekdayKey, field: "open" | "close", time: string) {
    const current = value[day];
    if (!current) return;
    onChange({
      ...value,
      [day]: { ...current, [field]: time },
    });
  }

  return (
    <div className="space-y-[var(--space-3)]">
      {WEEKDAY_ORDER.map((day) => {
        const dayHours = value[day];
        const isOpen = dayHours !== null;
        return (
          <div
            key={day}
            className="grid grid-cols-[1fr_auto] items-center gap-[var(--space-2)] border-b border-border pb-[var(--space-2)]"
          >
            <div>
              <p className="text-sm font-medium">{WEEKDAY_LABELS[day]}</p>
              {isOpen ? (
                <div className="mt-[var(--space-1)] flex gap-[var(--space-2)]">
                  <Input
                    type="time"
                    value={dayHours.open}
                    onChange={(event) => updateDayTime(day, "open", event.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="time"
                    value={dayHours.close}
                    onChange={(event) => updateDayTime(day, "close", event.target.value)}
                    className="h-8"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Geschlossen</p>
              )}
            </div>
            <Button
              type="button"
              variant={isOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => toggleDay(day, !isOpen)}
            >
              {isOpen ? "Geöffnet" : "Geschlossen"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
