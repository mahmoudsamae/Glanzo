"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CustomerListItem } from "@/server/modules/customers/customers.types";
import type { NavRole } from "@/components/layout/nav";

import { CustomersList } from "./customers-list.client";
import { CustomersSkeleton } from "./customers-skeleton";

type CustomersShellProps = {
  role: NavRole;
  customers: CustomerListItem[];
  isLoading: boolean;
  isError: boolean;
  serverSearch: string;
  onSearch: (query: string) => void;
  onRefetch: () => void;
  onCreateCustomer: (input: {
    name: string;
    phone: string;
    email?: string | null;
  }) => Promise<{ ok: boolean }>;
};

export function CustomersShell({
  role,
  customers,
  isLoading,
  isError,
  serverSearch,
  onSearch,
  onRefetch,
  onCreateCustomer,
}: CustomersShellProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (isLoading) {
    return <CustomersSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Customers unavailable"
        actionLabel="Try again"
        onAction={onRefetch}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[360px] flex-1 px-[var(--space-4)] py-[var(--space-8)] lg:max-w-2xl lg:px-[var(--space-8)]">
      <div className="mb-[var(--space-4)] flex items-center justify-between">
        <h1 className="font-display text-2xl">Customers</h1>
        {role === "owner" ? (
          <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
            Add customer
          </Button>
        ) : null}
      </div>
      <CustomersList customers={customers} onSearch={onSearch} serverSearch={serverSearch} />
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add customer</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-[var(--space-3)]">
            <div>
              <Label htmlFor="customer-name">Name</Label>
              <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="customer-phone">Phone</Label>
              <Input id="customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="customer-email">Email (optional)</Label>
              <Input id="customer-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button
              type="button"
              onClick={async () => {
                const result = await onCreateCustomer({
                  name,
                  phone,
                  email: email.trim() ? email.trim() : null,
                });
                if (result.ok) {
                  setAddOpen(false);
                  setName("");
                  setPhone("");
                  setEmail("");
                }
              }}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
