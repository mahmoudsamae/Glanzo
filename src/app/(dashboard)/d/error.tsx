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
      title="Something went wrong"
      description="This view could not load."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
