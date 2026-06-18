"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmSheet } from "@/components/shared/confirm-sheet";
import { DashboardPage, DashboardPageHeader, DashboardPanel, DashboardPrimaryButton } from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { centsToEurInput, eurInputToCents } from "@/lib/money/price";
import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";

import {
  archiveServiceAction,
  createServiceAction,
  fetchServicesCatalogAction,
  reorderServicesAction,
  updateServiceAction,
} from "../api";
import { ServicesLedgerList } from "./services-ledger-list.client";

type ServicesBoardProps = {
  shopId: string;
  initialServices: ServiceCatalogItem[];
  barbers: BarberOption[];
};

type FormState = {
  id?: string;
  name: string;
  durationMin: number;
  priceInput: string;
  membershipIds: string[];
};

function emptyForm(): FormState {
  return { name: "", durationMin: 30, priceInput: "", membershipIds: [] };
}

function moveService(
  items: ServiceCatalogItem[],
  index: number,
  direction: -1 | 1,
): ServiceCatalogItem[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) {
    return items;
  }
  const next = [...items];
  const current = next[index];
  const swap = next[target];
  if (!current || !swap) {
    return items;
  }
  next[index] = swap;
  next[target] = current;
  return next;
}

export function ServicesBoard({ shopId, initialServices, barbers }: ServicesBoardProps) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [archiveTarget, setArchiveTarget] = useState<ServiceCatalogItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function syncCatalog() {
    const refreshed = await fetchServicesCatalogAction();
    if (refreshed.ok) {
      setServices(refreshed.data.services);
    }
    router.refresh();
  }

  function openCreate() {
    setForm(emptyForm());
    setError(null);
    setFormOpen(true);
  }

  function openEdit(service: ServiceCatalogItem) {
    setForm({
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      priceInput: centsToEurInput(service.priceCents),
      membershipIds: service.assignedMembershipIds,
    });
    setError(null);
    setFormOpen(true);
  }

  function submitForm() {
    const priceCents = eurInputToCents(form.priceInput);
    if (!form.name.trim() || priceCents === null) {
      setError("Enter a name and valid price.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        durationMin: form.durationMin,
        priceCents,
        membershipIds: form.membershipIds,
      };

      const result = form.id
        ? await updateServiceAction({ id: form.id, ...payload })
        : await createServiceAction(payload);

      if (!result.ok) {
        setError("Could not save service.");
        return;
      }

      setFormOpen(false);
      await syncCatalog();
    });
  }

  function confirmArchive() {
    if (!archiveTarget) return;
    startTransition(async () => {
      const result = await archiveServiceAction(archiveTarget.id);
      if (!result.ok) {
        setError("Could not archive service.");
        return;
      }
      setArchiveTarget(null);
      await syncCatalog();
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const visibleList = showArchived ? services : services.filter((s) => !s.archivedAt);
    const reorderedVisible = moveService(visibleList, index, direction);
    const visibleIds = new Set(visibleList.map((s) => s.id));
    const hidden = services.filter((s) => !visibleIds.has(s.id));
    const orderedIds = [...reorderedVisible.map((s) => s.id), ...hidden.map((s) => s.id)];

    setServices([...reorderedVisible, ...hidden]);
    startTransition(async () => {
      await reorderServicesAction({ shopId, orderedIds });
    });
  }

  const visible = showArchived ? services : services.filter((s) => !s.archivedAt);

  if (services.length === 0) {
    return (
      <DashboardPage width="md">
        <DashboardPageHeader
          kicker="Price board"
          title="What do you charge?"
          subtitle="Add your cuts and prices — clients see these on your mini-site later."
          action={
            <DashboardPrimaryButton type="button" onClick={openCreate}>
              Add your first service
            </DashboardPrimaryButton>
          }
        />
        <ServiceFormSheet
          open={formOpen}
          onOpenChange={setFormOpen}
          form={form}
          setForm={setForm}
          barbers={barbers}
          error={error}
          pending={isPending}
          onSubmit={submitForm}
          title="New service"
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage width="lg">
      <DashboardPageHeader
        kicker="Price board"
        title="Services"
        subtitle="Drag order, edit prices, and assign barbers — synced to booking."
        action={
          <DashboardPrimaryButton type="button" size="sm" onClick={openCreate}>
            Add service
          </DashboardPrimaryButton>
        }
      />

      <DashboardPanel title="Menu" description={`${visible.length} active on your mini-site`}>
        <ServicesLedgerList
        services={visible}
        barbers={barbers}
        onMove={handleMove}
        onEdit={openEdit}
        onArchive={setArchiveTarget}
        />
      </DashboardPanel>

      <button
        type="button"
        className="mt-[var(--space-4)] text-sm text-[var(--brass)] underline-offset-4 hover:underline"
        onClick={() => setShowArchived((v) => !v)}
      >
        {showArchived ? "Hide archived" : "Show archived"}
      </button>

      {error ? <p className="mt-[var(--space-4)] text-sm text-destructive">{error}</p> : null}

      <ServiceFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        setForm={setForm}
        barbers={barbers}
        error={error}
        pending={isPending}
        onSubmit={submitForm}
        title={form.id ? "Edit service" : "New service"}
      />

      <ConfirmSheet
        open={archiveTarget !== null}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archive service?"
        description={
          archiveTarget
            ? `"${archiveTarget.name}" will be hidden from booking. You can still view it under archived.`
            : null
        }
        confirmLabel="Archive"
        pending={isPending}
        onConfirm={confirmArchive}
      />
    </DashboardPage>
  );
}

function ServiceFormSheet({
  open,
  onOpenChange,
  form,
  setForm,
  barbers,
  error,
  pending,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormState;
  setForm: (form: FormState) => void;
  barbers: BarberOption[];
  error: string | null;
  pending: boolean;
  onSubmit: () => void;
  title: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto lg:inset-y-0 lg:right-0 lg:left-auto lg:max-w-md lg:rounded-none lg:border-t-0 lg:border-l">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="service-name">Name</Label>
            <Input
              id="service-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-[var(--space-2)]">
            <Label>Duration (minutes)</Label>
            <div className="flex items-center gap-[var(--space-2)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({ ...form, durationMin: Math.max(5, form.durationMin - 5) })
                }
              >
                −
              </Button>
              <span className="text-data w-12 text-center">{form.durationMin}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({ ...form, durationMin: Math.min(480, form.durationMin + 5) })
                }
              >
                +
              </Button>
            </div>
          </div>
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="service-price">Price (EUR)</Label>
            <Input
              id="service-price"
              inputMode="decimal"
              value={form.priceInput}
              onChange={(e) => setForm({ ...form, priceInput: e.target.value })}
            />
          </div>
          {barbers.length > 0 ? (
            <fieldset className="space-y-[var(--space-2)]">
              <legend className="text-sm font-medium">Barbers</legend>
              {barbers.map((barber) => (
                <label key={barber.membershipId} className="flex items-center gap-[var(--space-2)] text-sm">
                  <input
                    type="checkbox"
                    checked={form.membershipIds.includes(barber.membershipId)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.membershipIds, barber.membershipId]
                        : form.membershipIds.filter((id) => id !== barber.membershipId);
                      setForm({ ...form, membershipIds: next });
                    }}
                  />
                  {barber.displayName}
                </label>
              ))}
            </fieldset>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" className="w-full" disabled={pending} onClick={onSubmit}>
            Save service
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
