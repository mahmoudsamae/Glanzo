"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  CustomerProfileView,
  deleteCustomerAction,
  updateCustomerNotesAction,
  useCustomerProfileQuery,
} from "@/features/customers";
import { EmptyState } from "@/components/shared/empty-state";
import { CustomersSkeleton } from "@/features/customers";
import type { NavRole } from "@/components/layout/nav";

type ProfileClientProps = {
  shopId: string;
  customerId: string;
  role: NavRole;
};

export function ProfileClient({ shopId, customerId, role }: ProfileClientProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCustomerProfileQuery(shopId, customerId);

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      const result = await updateCustomerNotesAction({ customerId, notes });
      if (result.ok) {
        void refetch();
      }
      return { ok: result.ok };
    },
    [customerId, refetch],
  );

  const handleDelete = useCallback(async () => {
    const result = await deleteCustomerAction({ customerId });
    if (result.ok) {
      router.push("/d/customers");
    }
    return { ok: result.ok };
  }, [customerId, router]);

  if (isLoading) {
    return <CustomersSkeleton />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Kunde nicht gefunden"
        actionLabel="Zurück zur Liste"
        onAction={() => router.push("/d/customers")}
      />
    );
  }

  return (
    <CustomerProfileView
      profile={data}
      role={role}
      onSaveNotes={handleSaveNotes}
      onDelete={role === "owner" ? handleDelete : undefined}
    />
  );
}
