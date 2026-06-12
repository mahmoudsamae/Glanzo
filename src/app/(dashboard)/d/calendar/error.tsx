"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function CalendarError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      title="Calendar unavailable"
      description="We hit an error loading your schedule."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
