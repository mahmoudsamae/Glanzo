"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  DashboardBadge,
  DashboardRowCard,
  DashboardRowList,
  DashboardSearch,
} from "@/components/dashboard";
import type { CustomerListItem } from "@/server/modules/customers/customers.types";

type CustomersListProps = {
  customers: CustomerListItem[];
  onSearch: (query: string) => void;
  serverSearch: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function CustomersList({ customers, onSearch, serverSearch }: CustomersListProps) {
  const [localQuery, setLocalQuery] = useState("");

  const visible = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    if (!q) {
      return customers;
    }
    return customers.filter(
      (customer) => customer.name.toLowerCase().includes(q) || customer.phone.includes(q),
    );
  }, [customers, localQuery]);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <DashboardSearch
        placeholder="Name oder Telefon suchen"
        value={localQuery}
        onChange={(event) => {
          setLocalQuery(event.target.value);
          if (event.target.value.length >= 3) {
            onSearch(event.target.value);
          }
        }}
        onBlur={() => {
          if (localQuery.length >= 3 && localQuery !== serverSearch) {
            onSearch(localQuery);
          }
        }}
      />
      {visible.length === 0 ? (
        <EmptyState title="Deine Stammkunden erscheinen hier nach der ersten Buchung." />
      ) : (
        <DashboardRowList layout="grid">
          {visible.map((customer) => (
            <DashboardRowCard
              key={customer.id}
              href={`/d/customers/${customer.id}`}
              avatar={initials(customer.name)}
              title={customer.name}
              subtitle={customer.phone}
              badges={
                <>
                  <DashboardBadge tone="brass">{customer.visitsCount} Besuche</DashboardBadge>
                  <DashboardBadge>
                    Zuletzt:{" "}
                    {customer.lastVisitAt
                      ? new Date(customer.lastVisitAt).toLocaleDateString("de-DE")
                      : "—"}
                  </DashboardBadge>
                </>
              }
            />
          ))}
        </DashboardRowList>
      )}
    </div>
  );
}
