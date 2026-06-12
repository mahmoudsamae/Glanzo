"use client";

import { useState, useTransition } from "react";

import { ConfirmSheet } from "@/components/shared/confirm-sheet";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatAppointmentDateTime } from "@/lib/booking/format-appointment";
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
            <SheetTitle>{active.customerName ?? "Walk-in"}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-[var(--space-3)] text-base">
            <p>{active.serviceName}</p>
            <p className="text-data">{formatAppointmentDateTime(active.startsAt, timezone)}</p>
            <p className="text-data">€{(active.priceCents / 100).toFixed(2)}</p>
            <StatusDot label={active.status} tone={active.source === "walk_in" ? "barber" : "owner"} />
            <p className="text-sm capitalize text-muted-foreground">{active.source.replace("_", " ")}</p>
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
                  Reschedule
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={!canComplete || isPending}
                onClick={() => runStatus("completed")}
              >
                Mark completed
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!canNoShow || isPending}
                onClick={() => runStatus("no_show")}
              >
                Mark no-show
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => setCancelOpen(true)}
              >
                Cancel
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
        title="Cancel appointment?"
        description="The customer will need a new booking. Snapshot data is kept on the ledger."
        confirmLabel="Cancel appointment"
        pending={isPending}
        onConfirm={() => runStatus("cancelled")}
      />
    </>
  );
}
