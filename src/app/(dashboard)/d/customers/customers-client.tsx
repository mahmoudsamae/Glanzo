"use client";

import { useCallback, useState } from "react";

import {
  createManualCustomerAction,
  CustomersShell,
  useCustomersListQuery,
} from "@/features/customers";
import type { NavRole } from "@/components/layout/nav";

type CustomersClientProps = {
  shopId: string;
  role: NavRole;
};

export function CustomersClient({ shopId, role }: CustomersClientProps) {
  const [search, setSearch] = useState<string | undefined>();
  const { data, isLoading, isError, refetch } = useCustomersListQuery(shopId, search);

  const handleCreate = useCallback(
    async (input: { name: string; phone: string; email?: string | null }) => {
      const result = await createManualCustomerAction(input);
      if (result.ok) {
        void refetch();
      }
      return { ok: result.ok };
    },
    [refetch],
  );

  return (
    <CustomersShell
      role={role}
      customers={data?.customers ?? []}
      isLoading={isLoading}
      isError={isError}
      serverSearch={search ?? ""}
      onSearch={setSearch}
      onRefetch={() => void refetch()}
      onCreateCustomer={handleCreate}
    />
  );
}
