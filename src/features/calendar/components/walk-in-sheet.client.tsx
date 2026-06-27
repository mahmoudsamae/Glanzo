"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PublicApiEnvelope } from "@/lib/api/public-response";
import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";
import { formatGridTime } from "../utils";

type AvailabilitySlot = {
  membershipId: string;
  startsAt: string;
  endsAt: string;
};

type WalkInSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopSlug: string;
  timezone: string;
  date: string;
  role: "owner" | "barber";
  lockedBarberId?: string;
  services: ServiceCatalogItem[];
  barbers: BarberOption[];
  granularityMin: number;
  onCreate: (input: {
    serviceId: string;
    membershipId: string;
    startsAt: string;
    name?: string;
    phone?: string;
  }) => Promise<{ ok: boolean; code?: string }>;
};

function snapNowToGranularity(now: Date, granularityMin: number): Date {
  const ms = granularityMin * 60_000;
  return new Date(Math.ceil(now.getTime() / ms) * ms);
}

export function WalkInSheet({
  open,
  onOpenChange,
  shopSlug,
  timezone,
  date,
  role,
  lockedBarberId,
  services,
  barbers,
  granularityMin,
  onCreate,
}: WalkInSheetProps) {
  const [serviceId, setServiceId] = useState("");
  const [barberChoice, setBarberChoice] = useState<string>("first");
  const effectiveBarberChoice = lockedBarberId ?? barberChoice;
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeServices = useMemo(
    () => services.filter((service) => !service.archivedAt),
    [services],
  );

  useEffect(() => {
    if (!open || !serviceId) {
      return;
    }
    const membershipQuery =
      effectiveBarberChoice === "first" ? "" : `&membershipId=${effectiveBarberChoice}`;
    void fetch(
      `/api/public/shops/${shopSlug}/availability?serviceId=${serviceId}&date=${date}${membershipQuery}`,
    )
      .then((response) => response.json() as Promise<PublicApiEnvelope<{ slots: AvailabilitySlot[] }>>)
      .then((body) => {
        if ("error" in body) {
          setSlots([]);
          return;
        }
        setSlots(body.data.slots);
      });
  }, [date, effectiveBarberChoice, open, serviceId, shopSlug]);

  const nowSlot = useMemo(() => {
    const snapped = snapNowToGranularity(new Date(), granularityMin).toISOString();
    if (effectiveBarberChoice === "first") {
      const match = slots.find((slot) => slot.startsAt >= snapped);
      return match ?? null;
    }
    return (
      slots.find(
        (slot) =>
          slot.membershipId === effectiveBarberChoice && slot.startsAt >= snapped,
      ) ?? null
    );
  }, [effectiveBarberChoice, granularityMin, slots]);

  function pickNow() {
    if (nowSlot) {
      setStartsAt(nowSlot.startsAt);
      if (effectiveBarberChoice === "first") {
        setBarberChoice(nowSlot.membershipId);
      }
    } else {
      setStartsAt(snapNowToGranularity(new Date(), granularityMin).toISOString());
    }
  }

  function resolveMembershipId(): string | null {
    if (effectiveBarberChoice !== "first") {
      return effectiveBarberChoice;
    }
    const slot = slots.find((item) => item.startsAt === startsAt);
    return slot?.membershipId ?? nowSlot?.membershipId ?? barbers[0]?.membershipId ?? null;
  }

  function handleCreate() {
    const membershipId = resolveMembershipId();
    if (!serviceId || !membershipId || !startsAt) {
      setError("Leistung, Barber und Uhrzeit wählen.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const payload: {
        serviceId: string;
        membershipId: string;
        startsAt: string;
        name?: string;
        phone?: string;
      } = { serviceId, membershipId, startsAt };

      if (name.trim() && phone.trim()) {
        payload.name = name.trim();
        payload.phone = phone.trim();
      }

      const result = await onCreate(payload);
      if (!result.ok) {
        setError(result.code ?? "Laufkundschaft konnte nicht angelegt werden.");
        return;
      }
      onOpenChange(false);
      setServiceId("");
      setBarberChoice("first");
      setStartsAt(null);
      setName("");
      setPhone("");
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-[var(--space-4)]">
        <SheetHeader>
          <SheetTitle>Laufkundschaft</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-[var(--space-3)]">
          <div>
            <Label htmlFor="walk-in-service">Leistung</Label>
            <select
              id="walk-in-service"
              className="mt-[var(--space-1)] w-full rounded-sm border border-border bg-transparent px-[var(--space-3)] py-[var(--space-2)]"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              <option value="">Leistung wählen</option>
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {role === "owner" ? (
            <div>
              <Label htmlFor="walk-in-barber">Barber</Label>
              <select
                id="walk-in-barber"
                className="mt-[var(--space-1)] w-full rounded-sm border border-border bg-transparent px-[var(--space-3)] py-[var(--space-2)]"
                value={barberChoice}
                onChange={(event) => setBarberChoice(event.target.value)}
              >
                <option value="first">Erster freier</option>
                {barbers.map((barber) => (
                  <option key={barber.membershipId} value={barber.membershipId}>
                    {barber.displayName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Barber: {barbers.find((b) => b.membershipId === lockedBarberId)?.displayName ?? "Du"}
            </p>
          )}

          <div className="flex flex-wrap gap-[var(--space-2)]">
            <Button type="button" variant="outline" size="sm" onClick={pickNow}>
              Jetzt
            </Button>
            {slots.slice(0, 8).map((slot) => (
              <Button
                key={`${slot.membershipId}-${slot.startsAt}`}
                type="button"
                variant={startsAt === slot.startsAt ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStartsAt(slot.startsAt);
                  if (barberChoice === "first") {
                    setBarberChoice(slot.membershipId);
                  }
                }}
              >
                {formatGridTime(new Date(slot.startsAt).getTime(), timezone)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <div>
              <Label htmlFor="walk-in-name">Name (optional)</Label>
              <Input id="walk-in-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="walk-in-phone">Telefon (optional)</Label>
              <Input id="walk-in-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="button" disabled={isPending} onClick={handleCreate}>
            Laufkundschaft anlegen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
