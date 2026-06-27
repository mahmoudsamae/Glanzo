"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function CustomersError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      title="Kunden nicht verfügbar"
      description="Beim Laden deiner Kundenliste ist ein Fehler aufgetreten."
      actionLabel="Erneut versuchen"
      onAction={reset}
    />
  );
}
