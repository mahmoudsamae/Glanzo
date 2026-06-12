"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function CustomersError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      title="Customers unavailable"
      description="We hit an error loading your customer list."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
