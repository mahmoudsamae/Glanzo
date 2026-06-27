"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function CalendarError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      title="Kalender nicht verfügbar"
      description="Beim Laden deines Kalenders ist ein Fehler aufgetreten."
      actionLabel="Erneut versuchen"
      onAction={reset}
    />
  );
}
