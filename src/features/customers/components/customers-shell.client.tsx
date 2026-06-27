"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPrimaryButton,
} from "@/components/dashboard";
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
      <DashboardPage width="md">
        <EmptyState title="Kunden nicht verfügbar" actionLabel="Erneut versuchen" onAction={onRefetch} />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage width="lg">
      <DashboardPageHeader
        kicker="Kundenkartei"
        title="Kunden"
        subtitle="Stammkunden, Laufkundschaft und Kontaktdaten — tippe auf eine Karte für das vollständige Profil."
        action={
          role === "owner" ? (
            <DashboardPrimaryButton type="button" size="sm" onClick={() => setAddOpen(true)}>
              Kunde hinzufügen
            </DashboardPrimaryButton>
          ) : null
        }
      />

      <DashboardPanel title="Verzeichnis" description={`${customers.length} im System`} padding="md">
        <CustomersList customers={customers} onSearch={onSearch} serverSearch={serverSearch} />
      </DashboardPanel>

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="salon-dash-panel border-t-0">
          <SheetHeader>
            <SheetTitle>Kunde hinzufügen</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-[var(--space-3)]">
            <div>
              <Label htmlFor="customer-name">Name</Label>
              <Input id="customer-name" className="salon-dash-search mt-[var(--space-2)]" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="customer-phone">Telefon</Label>
              <Input id="customer-phone" className="salon-dash-search mt-[var(--space-2)]" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="customer-email">E-Mail (optional)</Label>
              <Input id="customer-email" className="salon-dash-search mt-[var(--space-2)]" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <DashboardPrimaryButton
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
              Speichern
            </DashboardPrimaryButton>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardPage>
  );
}
