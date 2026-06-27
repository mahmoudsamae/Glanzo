"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Image from "next/image";

import { ConfirmSheet } from "@/components/shared/confirm-sheet";
import { DashboardPage, DashboardPageHeader, DashboardPanel, DashboardPrimaryButton } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { centsToEurInput, eurInputToCents } from "@/lib/money/price";
import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";

import { shopMediaPublicUrl } from "@/lib/minisite/media-url";

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
  showPrice: boolean;
  description: string;
  imagePath: string | null;
  membershipIds: string[];
};

function emptyForm(): FormState {
  return {
    name: "",
    durationMin: 30,
    priceInput: "",
    showPrice: true,
    description: "",
    imagePath: null,
    membershipIds: [],
  };
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
  const [uploadingImage, setUploadingImage] = useState(false);
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
      priceInput: service.showPrice ? centsToEurInput(service.priceCents) : "",
      showPrice: service.showPrice,
      description: service.description ?? "",
      imagePath: service.imagePath,
      membershipIds: service.assignedMembershipIds,
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    setError(null);
    const { uploadShopMediaFile } = await import("@/features/minisite/lib/upload-media.client");
    const result = await uploadShopMediaFile(shopId, "service", file);
    setUploadingImage(false);
    if (!result.ok) {
      const message = result.message.includes("row-level security")
        ? "Bild-Upload blockiert — bitte Datenbank-Migration ausführen (supabase db push) oder Admin kontaktieren."
        : result.message;
      setError(message);
      return;
    }
    setForm((current) => ({ ...current, imagePath: result.path }));
  }

  function submitForm() {
    if (!form.name.trim()) {
      setError("Bitte einen Leistungsnamen eingeben.");
      return;
    }

    const priceCents = form.showPrice ? eurInputToCents(form.priceInput) : 0;
    if (form.showPrice && priceCents === null) {
      setError("Bitte einen gültigen Preis eingeben oder Preis ausblenden und Beschreibung hinzufügen.");
      return;
    }
    if (!form.showPrice && !form.description.trim()) {
      setError("Bitte eine kurze Beschreibung angeben, wenn der Preis ausgeblendet wird.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        durationMin: form.durationMin,
        showPrice: form.showPrice,
        priceCents: form.showPrice ? (priceCents ?? 0) : 0,
        description: form.description.trim() || null,
        imagePath: form.imagePath,
        membershipIds: form.membershipIds,
      };

      const result = form.id
        ? await updateServiceAction({ id: form.id, ...payload })
        : await createServiceAction(payload);

      if (!result.ok) {
        setError("Leistung konnte nicht gespeichert werden.");
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
        setError("Leistung konnte nicht archiviert werden.");
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
          kicker="Preisliste"
          title="Was kostet was?"
          subtitle="Leistungen und Preise hinzufügen — Kunden sehen diese später auf deiner Website."
          action={
            <DashboardPrimaryButton type="button" onClick={openCreate}>
              Erste Leistung hinzufügen
            </DashboardPrimaryButton>
          }
        />
        <ServiceFormSheet
          shopId={shopId}
          open={formOpen}
          onOpenChange={setFormOpen}
          form={form}
          setForm={setForm}
          barbers={barbers}
          error={error}
          pending={isPending}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
          onSubmit={submitForm}
          title="Neue Leistung"
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage width="lg">
      <DashboardPageHeader
        kicker="Preisliste"
        title="Leistungen"
        subtitle="Reihenfolge, Preise und Barber zuweisen — synchron mit der Buchung."
        action={
          <DashboardPrimaryButton type="button" size="sm" onClick={openCreate}>
            Leistung hinzufügen
          </DashboardPrimaryButton>
        }
      />

      <DashboardPanel title="Menü" description={`${visible.length} aktiv auf deiner Website`}>
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
        {showArchived ? "Archivierte ausblenden" : "Archivierte anzeigen"}
      </button>

      {error ? <p className="mt-[var(--space-4)] text-sm text-destructive">{error}</p> : null}

      <ServiceFormSheet
        shopId={shopId}
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        setForm={setForm}
        barbers={barbers}
        error={error}
        pending={isPending}
        uploadingImage={uploadingImage}
        onImageUpload={handleImageUpload}
        onSubmit={submitForm}
        title={form.id ? "Leistung bearbeiten" : "Neue Leistung"}
      />

      <ConfirmSheet
        open={archiveTarget !== null}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Leistung archivieren?"
        description={
          archiveTarget
            ? `"${archiveTarget.name}" wird aus der Buchung ausgeblendet. Unter Archivierte ist sie weiterhin sichtbar.`
            : null
        }
        confirmLabel="Archivieren"
        pending={isPending}
        onConfirm={confirmArchive}
      />
    </DashboardPage>
  );
}

function ServiceFormSheet({
  shopId: _shopId,
  open,
  onOpenChange,
  form,
  setForm,
  barbers,
  error,
  pending,
  uploadingImage,
  onImageUpload,
  onSubmit,
  title,
}: {
  shopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormState;
  setForm: (form: FormState) => void;
  barbers: BarberOption[];
  error: string | null;
  pending: boolean;
  uploadingImage: boolean;
  onImageUpload: (file: File) => void;
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
            <Label>Leistungsbild</Label>
            <p className="text-xs text-[var(--text-2)]">Wird auf deiner öffentlichen Website angezeigt.</p>
            {form.imagePath ? (
              <div className="flex items-center gap-[var(--space-3)]">
                <span className="relative block size-16 overflow-hidden rounded-md border border-border">
                  <Image
                    src={shopMediaPublicUrl(form.imagePath)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <button
                  type="button"
                  className="text-sm text-[var(--text-2)] underline-offset-4 hover:underline"
                  onClick={() => setForm({ ...form, imagePath: null })}
                >
                  Entfernen
                </button>
              </div>
            ) : null}
            <label className="inline-flex cursor-pointer text-sm font-medium text-[var(--brass)] underline-offset-4 hover:underline">
              {uploadingImage ? "Wird hochgeladen…" : "+ Bild hochladen"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploadingImage || pending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onImageUpload(file);
                }}
              />
            </label>
          </div>

          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="service-description">Kurzbeschreibung</Label>
            <textarea
              id="service-description"
              rows={3}
              maxLength={240}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="z. B. Waschen, Schneiden und Styling inklusive"
              className="flex min-h-[5rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-[var(--space-2)]">
            <Label>Dauer (Minuten)</Label>
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

          <label className="flex cursor-pointer items-start gap-[var(--space-3)]">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.showPrice}
              onChange={(e) => setForm({ ...form, showPrice: e.target.checked })}
            />
            <span>
              <span className="block text-sm font-medium">Preis auf Website anzeigen</span>
              <span className="mt-0.5 block text-xs text-[var(--text-2)]">
                Deaktivieren, um nur die Beschreibung auf deiner Website anzuzeigen.
              </span>
            </span>
          </label>

          {form.showPrice ? (
            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="service-price">Preis (EUR)</Label>
              <Input
                id="service-price"
                inputMode="decimal"
                value={form.priceInput}
                onChange={(e) => setForm({ ...form, priceInput: e.target.value })}
              />
            </div>
          ) : null}
          {barbers.length > 0 ? (
            <fieldset className="space-y-[var(--space-2)]">
              <legend className="text-sm font-medium">Barber</legend>
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
            Leistung speichern
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
