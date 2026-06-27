"use client";

import { useState, useTransition } from "react";

import { ConfirmSheet } from "@/components/shared/confirm-sheet";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { appointmentStatusLabel } from "@/lib/appointments/status-label";
import { canViewShopRevenue } from "@/lib/dashboard/nav-config";
import type { AppointmentListItem, BarberColumn } from "@/server/modules/appointments/appointments.types";

import { RescheduleSlotPicker } from "./reschedule-slot-picker.client";

type StatusUpdateInput = {
  appointmentId: string;
  status: "completed" | "no_show" | "cancelled";
};

type AppointmentDetailSheetProps = {
  appointment: AppointmentListItem | null;
  timezone: string;
  role: "owner" | "barber";
  actorMembershipId: string;
  shopSlug: string;
  barbers: BarberColumn[];
  nowMs: number;
  onClose: () => void;
  onUpdated: () => void;
  onStatusUpdate: (input: StatusUpdateInput) => Promise<{ ok: boolean }>;
  onMoveAppointment: (input: {
    appointmentId: string;
    startsAt: string;
    membershipId?: string;
  }) => void;
  movePending?: boolean;
};

function formatAppointmentDateTimeDe(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

function appointmentSourceLabel(source: AppointmentListItem["source"]): string {
  if (source === "walk_in") {
    return "Laufkundschaft";
  }
  return "Online";
}

export function AppointmentDetailSheet({
  appointment,
  timezone,
  role,
  actorMembershipId,
  shopSlug,
  barbers,
  nowMs,
  onClose,
  onUpdated,
  onStatusUpdate,
  onMoveAppointment,
  movePending = false,
}: AppointmentDetailSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!appointment) {
    return null;
  }

  const active = appointment;
  const started = nowMs >= new Date(active.startsAt).getTime();
  const canComplete = active.status === "booked" && started;
  const canNoShow = active.status === "booked" && started;
  const canReschedule =
    active.status === "booked" &&
    (role === "owner" || active.membershipId === actorMembershipId);

  function runStatus(status: "completed" | "no_show" | "cancelled") {
    startTransition(async () => {
      const result = await onStatusUpdate({
        appointmentId: active.id,
        status,
      });
      if (result.ok) {
        onUpdated();
        onClose();
      }
    });
  }

  function confirmReschedule(input: { startsAt: string; membershipId: string }) {
    onMoveAppointment({
      appointmentId: active.id,
      startsAt: input.startsAt,
      membershipId:
        input.membershipId !== active.membershipId ? input.membershipId : undefined,
    });
    setRescheduleOpen(false);
    onClose();
  }

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="gap-[var(--space-4)]">
          <SheetHeader>
            <SheetTitle>{active.customerName ?? "Laufkundschaft"}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-[var(--space-3)] text-base">
            <p>{active.serviceName}</p>
            <p className="text-data">{formatAppointmentDateTimeDe(active.startsAt, timezone)}</p>
            {canViewShopRevenue(role) ? (
              <p className="text-data">€{(active.priceCents / 100).toFixed(2)}</p>
            ) : null}
            <StatusDot
              label={appointmentStatusLabel(active.status)}
              tone={active.source === "walk_in" ? "barber" : "owner"}
            />
            <p className="text-sm text-muted-foreground">{appointmentSourceLabel(active.source)}</p>
          </div>
          {active.status === "booked" ? (
            <div className="flex flex-col gap-[var(--space-2)]">
              {canReschedule ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={movePending || isPending}
                  onClick={() => setRescheduleOpen(true)}
                >
                  Verschieben
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={!canComplete || isPending}
                onClick={() => runStatus("completed")}
              >
                Als abgeschlossen markieren
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!canNoShow || isPending}
                onClick={() => runStatus("no_show")}
              >
                Als nicht erschienen markieren
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => setCancelOpen(true)}
              >
                Stornieren
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      <RescheduleSlotPicker
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        shopSlug={shopSlug}
        serviceId={active.serviceId}
        timezone={timezone}
        startsAt={active.startsAt}
        role={role}
        actorMembershipId={actorMembershipId}
        barbers={barbers}
        pending={movePending}
        onConfirm={confirmReschedule}
      />
      <ConfirmSheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Termin stornieren?"
        description="Der Kunde muss neu buchen. Snapshot-Daten bleiben im Ledger erhalten."
        confirmLabel="Termin stornieren"
        pending={isPending}
        onConfirm={() => runStatus("cancelled")}
      />
    </>
  );
}
