"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmSheet } from "@/components/shared/confirm-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicApiAlternativeSlot, PublicApiEnvelope } from "@/lib/api/public-response";
import {
  appointmentDateInTimezone,
  formatAppointmentDateTime,
} from "@/lib/booking/format-appointment";
import { bookingErrorMessage, type BookingErrorCode } from "@/lib/booking/errors";
import type { GetBookingByTokenRpcResult } from "@/types/database-rpc.types";

type ManageBookingClientProps = {
  token: string;
  booking: GetBookingByTokenRpcResult;
  timezone: string;
  shopSlug: string;
  serviceId: string;
  membershipId: string;
};

type AvailabilitySlot = PublicApiAlternativeSlot;

function statusHeadline(status: GetBookingByTokenRpcResult["status"]): string {
  switch (status) {
    case "booked":
      return "Gebucht.";
    case "cancelled":
      return "Storniert.";
    case "completed":
      return "Abgeschlossen.";
    case "no_show":
      return "Nicht erschienen.";
    default:
      return "Termin.";
  }
}

export function ManageBookingClient({
  token,
  booking: initialBooking,
  timezone,
  shopSlug,
  serviceId,
  membershipId,
}: ManageBookingClientProps) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(
    appointmentDateInTimezone(booking.starts_at, timezone),
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [alternatives, setAlternatives] = useState<AvailabilitySlot[]>([]);
  const [isPending, startTransition] = useTransition();

  const isBooked = booking.status === "booked";
  const formattedWhen = formatAppointmentDateTime(booking.starts_at, timezone);

  async function loadSlots(date: string) {
    setError(null);
    setAlternatives([]);
    const response = await fetch(
      `/api/public/shops/${shopSlug}/availability?serviceId=${serviceId}&date=${date}&membershipId=${membershipId}`,
    );
    const body = (await response.json()) as PublicApiEnvelope<{ slots: AvailabilitySlot[] }>;
    if ("error" in body) {
      setSlots([]);
      setError(body.error.message);
      return;
    }
    setSlots(body.data.slots);
  }

  function openReschedule() {
    setRescheduleOpen(true);
    setSelectedSlot(null);
    void loadSlots(rescheduleDate);
  }

  function confirmCancel() {
    startTransition(async () => {
      setError(null);
      const response = await fetch(`/api/public/bookings/${token}/cancel`, { method: "POST" });
      const body = (await response.json()) as PublicApiEnvelope<{ status: string }>;
      if ("error" in body) {
        const code = body.error.code as BookingErrorCode;
        if (code === "TOO_LATE") {
          setError(
            `${bookingErrorMessage("TOO_LATE")} Contact the shop directly if you need help.`,
          );
        } else {
          setError(body.error.message);
        }
        setCancelOpen(false);
        return;
      }
      setCancelOpen(false);
      setBooking((current) => ({ ...current, status: "cancelled" }));
      router.refresh();
    });
  }

  function confirmReschedule() {
    if (!selectedSlot || isPending) {
      return;
    }

    startTransition(async () => {
      setError(null);
      setAlternatives([]);
      const response = await fetch(`/api/public/bookings/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt: selectedSlot.startsAt }),
      });
      const body = (await response.json()) as PublicApiEnvelope<{
        manageUrl: string;
        starts_at: string;
        ends_at: string;
        status?: string;
      }>;
      if ("error" in body) {
        if (body.error.code === "SLOT_TAKEN" && body.error.alternatives?.length) {
          setAlternatives(body.error.alternatives);
        }
        setError(body.error.message);
        return;
      }
      setRescheduleOpen(false);
      router.replace(body.data.manageUrl);
    });
  }

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <header className="flex flex-col gap-[var(--space-2)] text-center">
        <h1 className="font-display text-2xl text-[color:var(--text-0)]">
          {statusHeadline(booking.status)}
        </h1>
        <p className="text-sm text-[var(--text-2)]">{booking.shop_name}</p>
      </header>

      <dl className="flex flex-col gap-[var(--space-3)] rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--ink-1)] px-[var(--space-4)] py-[var(--space-4)] text-sm">
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[var(--text-2)]">Wann</dt>
          <dd className="text-right text-data text-[color:var(--text-0)]">{formattedWhen}</dd>
        </div>
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[var(--text-2)]">Service</dt>
          <dd className="text-right text-[color:var(--text-0)]">{booking.service_name}</dd>
        </div>
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[var(--text-2)]">Barber</dt>
          <dd className="text-right text-[color:var(--text-0)]">{booking.barber_display_name}</dd>
        </div>
      </dl>
      <p className="text-center text-xs text-[var(--text-2)]">
        Zeiten in {timezone.replaceAll("_", " ")}.
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {alternatives.length > 0 ? (
        <section className="flex flex-col gap-[var(--space-3)]">
          <p className="text-sm text-[var(--text-2)]">Diese Zeiten sind noch frei:</p>
          <div className="flex flex-col gap-[var(--space-2)]">
            {alternatives.map((slot) => (
              <Button
                key={`${slot.membershipId}-${slot.startsAt}`}
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setSelectedSlot(slot);
                  setAlternatives([]);
                }}
              >
                {formatAppointmentDateTime(slot.startsAt, timezone)}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {isBooked ? (
        <div className="flex flex-col gap-[var(--space-3)]">
          <Button type="button" variant="outline" disabled={isPending} onClick={openReschedule}>
            Umbuchen
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => setCancelOpen(true)}
          >
            Termin stornieren
          </Button>
        </div>
      ) : null}

      <ConfirmSheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Termin stornieren?"
        description="Das lässt sich nicht rückgängig machen. Du musst ggf. neu buchen."
        confirmLabel="Stornieren"
        pending={isPending}
        onConfirm={confirmCancel}
      />

      <ConfirmSheet
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        title="Termin umbuchen"
        description={
          <div className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-col gap-[var(--space-2)]">
              <Label htmlFor="reschedule-date">Datum</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                disabled={isPending}
                onChange={(event) => {
                  setRescheduleDate(event.target.value);
                  setSelectedSlot(null);
                  void loadSlots(event.target.value);
                }}
              />
            </div>
            {slots.length > 0 ? (
              <div className="flex flex-col gap-[var(--space-2)]">
                <p className="text-sm text-muted-foreground">Freie Zeiten</p>
                {slots.map((slot) => (
                  <Button
                    key={`${slot.membershipId}-${slot.startsAt}`}
                    type="button"
                    variant={selectedSlot?.startsAt === slot.startsAt ? "default" : "outline"}
                    disabled={isPending}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatAppointmentDateTime(slot.startsAt, timezone)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Zeiten an diesem Tag.</p>
            )}
          </div>
        }
        confirmLabel="Umbuchen bestätigen"
        pending={isPending}
        onConfirm={confirmReschedule}
      />
    </div>
  );
}
