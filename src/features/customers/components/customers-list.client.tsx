"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import type { CustomerListItem } from "@/server/modules/customers/customers.types";

type CustomersListProps = {
  customers: CustomerListItem[];
  onSearch: (query: string) => void;
  serverSearch: string;
};

export function CustomersList({ customers, onSearch, serverSearch }: CustomersListProps) {
  const [localQuery, setLocalQuery] = useState("");

  const visible = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    if (!q) {
      return customers;
    }
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) || customer.phone.includes(q),
    );
  }, [customers, localQuery]);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Input
        placeholder="Search name or phone"
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
        <EmptyState title="Your regulars will appear here after their first booking." />
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/d/customers/${customer.id}`}
                className="flex h-9 items-center gap-[var(--space-3)] text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{customer.name}</span>
                <span className="text-data tabular-nums text-muted-foreground">
                  {customer.phone}
                </span>
                <span className="tabular-nums text-muted-foreground">{customer.visitsCount}</span>
                <span className="hidden text-data tabular-nums text-muted-foreground sm:inline">
                  {customer.lastVisitAt
                    ? new Date(customer.lastVisitAt).toLocaleDateString("en-GB")
                    : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
