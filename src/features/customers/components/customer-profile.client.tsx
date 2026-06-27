"use client";

import { useState, useTransition } from "react";

import { ConfirmSheet } from "@/components/shared/confirm-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { appointmentStatusLabel } from "@/lib/appointments/status-label";
import type { CustomerProfile } from "@/server/modules/customers/customers.types";
import type { NavRole } from "@/components/layout/nav";

type CustomerProfileViewProps = {
  profile: CustomerProfile;
  role: NavRole;
  onSaveNotes: (notes: string) => Promise<{ ok: boolean }>;
  onDelete?: () => Promise<{ ok: boolean }>;
};

export function CustomerProfileView({
  profile,
  role,
  onSaveNotes,
  onDelete,
}: CustomerProfileViewProps) {
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function saveNotes() {
    startTransition(async () => {
      await onSaveNotes(notes);
    });
  }

  function confirmDelete() {
    if (!onDelete) {
      return;
    }
    startTransition(async () => {
      const result = await onDelete();
      if (result.ok) {
        setDeleteOpen(false);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-[360px] flex-1 px-[var(--space-4)] py-[var(--space-8)] lg:max-w-2xl lg:px-[var(--space-8)]">
      <header className="flex flex-col gap-[var(--space-2)]">
        <h1 className="font-display text-2xl">{profile.name}</h1>
        <a href={`tel:${profile.phone}`} className="text-data text-[var(--brass)]">
          {profile.phone}
        </a>
        {profile.email ? <p className="text-sm text-muted-foreground">{profile.email}</p> : null}
        <p className="text-sm text-[var(--text-2)]">
          {profile.visitsCount} Besuche · {profile.noShowCount} No-Shows · €
          {(profile.totalSpentCents / 100).toFixed(2)} ausgegeben
        </p>
      </header>

      <section className="mt-[var(--space-8)]">
        <h2 className="mb-[var(--space-3)] text-sm font-medium">Besuchsverlauf</h2>
        {profile.visits.length === 0 ? (
          <EmptyState title="Noch keine Besuche." />
        ) : (
          <ul className="divide-y divide-border">
            {profile.visits.map((visit) => (
              <li key={visit.id} className="flex h-9 items-center gap-[var(--space-2)] text-sm">
                <span className="text-data tabular-nums">
                  {new Date(visit.startsAt).toLocaleDateString("de-DE")}
                </span>
                <span className="flex-1 truncate">{visit.serviceName}</span>
                <span className="truncate text-muted-foreground">{visit.barberName}</span>
                <span className="text-data tabular-nums">
                  €{(visit.priceCents / 100).toFixed(2)}
                </span>
                <StatusDot label={appointmentStatusLabel(visit.status)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-[var(--space-8)]">
        <h2 className="mb-[var(--space-2)] text-sm font-medium">Notizen</h2>
        <textarea
          className="min-h-24 w-full rounded-sm border border-border bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-sm"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={saveNotes}
          rows={4}
          disabled={isPending}
        />
      </section>

      {role === "owner" && onDelete ? (
        <Button
          type="button"
          variant="destructive"
          className="mt-[var(--space-8)]"
          onClick={() => setDeleteOpen(true)}
        >
          Kunde löschen
        </Button>
      ) : null}

      <ConfirmSheet
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Kunde löschen?"
        description="Der Kundendatensatz wird entfernt. Vergangene Termine behalten ihre Snapshot-Daten im Ledger."
        confirmLabel="Löschen"
        pending={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
