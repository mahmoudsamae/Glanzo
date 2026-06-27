"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PublicApiEnvelope } from "@/lib/api/public-response";
import { appointmentDateInTimezone } from "@/lib/booking/format-appointment";
import type { BarberColumn } from "@/server/modules/appointments/appointments.types";

import { formatGridTime } from "../utils";

type AvailabilitySlot = {
  membershipId: string;
  startsAt: string;
  endsAt: string;
};

type RescheduleSlotPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopSlug: string;
  serviceId: string;
  timezone: string;
  startsAt: string;
  role: "owner" | "barber";
  actorMembershipId: string;
  barbers: BarberColumn[];
  pending?: boolean;
  onConfirm: (input: { startsAt: string; membershipId: string }) => void;
};

export function RescheduleSlotPicker({
  open,
  onOpenChange,
  shopSlug,
  serviceId,
  timezone,
  startsAt,
  role,
  actorMembershipId,
  barbers,
  pending = false,
  onConfirm,
}: RescheduleSlotPickerProps) {
  const seedDate = appointmentDateInTimezone(startsAt, timezone);
  const [date, setDate] = useState(seedDate);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const barberNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const barber of barbers) {
      map.set(barber.membershipId, barber.displayName);
    }
    return map;
  }, [barbers]);

  useEffect(() => {
    if (!open || !serviceId) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const membershipQuery =
        role === "barber" ? `&membershipId=${actorMembershipId}` : "";
      const response = await fetch(
        `/api/public/shops/${shopSlug}/availability?serviceId=${serviceId}&date=${date}${membershipQuery}`,
      );
      const body = (await response.json()) as PublicApiEnvelope<{ slots: AvailabilitySlot[] }>;
      if ("error" in body) {
        setSlots([]);
        setError(body.error.message);
        return;
      }
      setSlots(body.data.slots);
    });
  }, [actorMembershipId, date, open, role, serviceId, shopSlug]);

  const visibleSlots =
    role === "barber"
      ? slots.filter((slot) => slot.membershipId === actorMembershipId)
      : slots;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDate(seedDate);
          setSelected(null);
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <SheetContent side="bottom" className="gap-[var(--space-4)]">
        <SheetHeader>
          <SheetTitle>Verschieben</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-[var(--space-3)]">
          <div>
            <Label htmlFor="reschedule-date">Datum</Label>
            <Input
              id="reschedule-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Termine werden geladen…</p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex max-h-48 flex-wrap gap-[var(--space-2)] overflow-y-auto">
            {visibleSlots.map((slot) => {
              const label = `${formatGridTime(new Date(slot.startsAt).getTime(), timezone)} · ${
                barberNameById.get(slot.membershipId) ?? "Barber"
              }`;
              const isSelected =
                selected?.startsAt === slot.startsAt &&
                selected.membershipId === slot.membershipId;
              return (
                <Button
                  key={`${slot.membershipId}-${slot.startsAt}`}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelected(slot)}
                >
                  {label}
                </Button>
              );
            })}
          </div>

          {!isLoading && visibleSlots.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">Keine freien Termine an diesem Tag.</p>
          ) : null}

          <Button
            type="button"
            disabled={!selected || pending}
            onClick={() => {
              if (!selected) {
                return;
              }
              onConfirm({
                startsAt: selected.startsAt,
                membershipId: selected.membershipId,
              });
            }}
          >
            Neue Uhrzeit bestätigen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
