"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      title="Etwas ist schiefgelaufen"
      description="Diese Ansicht konnte nicht geladen werden."
      actionLabel="Erneut versuchen"
      onAction={reset}
    />
  );
}
