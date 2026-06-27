"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPlatformOwnerInviteAction,
  setPlatformOwnerEmailAction,
  setPlatformOwnerPasswordAction,
  setPlatformShopMinisiteTemplatesAction,
  setPlatformShopStatusAction,
  setPlatformShopBookingAutoAssignAction,
  setPlatformMinisiteManagedAction,
} from "../api";
import { normalizeAllowedMinisiteTemplates } from "@/lib/minisite/allowed-templates";
import { MINISITE_TEMPLATES } from "@/lib/minisite/template-registry";
import type { MinisiteTemplate } from "@/lib/validations/public-shop";
import { buildInviteAbsoluteUrl } from "@/lib/admin/invite-url";
import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";
import type { z } from "zod";

import type { platformShopDetailSchema } from "@/lib/validations/platform-admin";

import { AdminShopToday } from "./admin-shop-today.client";
import { AdminEmptyState, AdminFact, AdminPageHero, AdminPanel } from "./admin-ui";
import { AdminAuditTimeline, AdminFadeIn, AdminTabBar, AdminTableShell } from "./admin-ui.client";
import { PlatformReasonSheet } from "./platform-reason-sheet.client";
import { ShopStatusBadge } from "./shop-status-badge";

type ShopDetail = z.infer<typeof platformShopDetailSchema>;

type AdminShopDetailProps = {
  shop: ShopDetail;
};

type DetailTab = "overview" | "today";
type PendingAction = "suspend" | "reactivate" | "email" | "password";

function credentialErrorMessage(code: string): string {
  switch (code) {
    case "NO_OWNER":
      return "Noch kein Inhaber-Konto — zuerst Einladung annehmen lassen.";
    case "EMAIL_TAKEN":
      return "Diese E-Mail ist bereits vergeben.";
    case "UNCHANGED":
      return "E-Mail ist unverändert.";
    case "VALIDATION":
      return "Bitte Eingaben prüfen (E-Mail gültig, Passwort min. 8 Zeichen, Begründung min. 10).";
    default:
      return "Aktion konnte nicht ausgeführt werden.";
  }
}

export function AdminShopDetail({ shop }: AdminShopDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [inviteEmail, setInviteEmail] = useState(shop.owner_email ?? "");
  const [credentialEmail, setCredentialEmail] = useState(shop.owner_email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [credentialSuccess, setCredentialSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState<MinisiteTemplate>(
    shop.minisite_template as MinisiteTemplate,
  );
  const [allowedTemplates, setAllowedTemplates] = useState<MinisiteTemplate[]>(
    normalizeAllowedMinisiteTemplates(
      shop.allowed_minisite_templates as MinisiteTemplate[],
      shop.minisite_template as MinisiteTemplate,
    ),
  );
  const [templateSuccess, setTemplateSuccess] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [autoAssignBarber, setAutoAssignBarber] = useState(shop.booking_auto_assign_barber);
  const [bookingModeSuccess, setBookingModeSuccess] = useState<string | null>(null);
  const [bookingModeError, setBookingModeError] = useState<string | null>(null);
  const [minisiteManaged, setMinisiteManaged] = useState(shop.minisite_managed);
  const [managedSuccess, setManagedSuccess] = useState<string | null>(null);
  const [managedError, setManagedError] = useState<string | null>(null);

  const minisiteUrl = buildShopMinisiteUrl(shop.slug);
  const isSuspended = shop.status === "suspended";
  const hasOwnerAccount = Boolean(shop.owner_user_id);

  function openSuspend() {
    setPendingAction("suspend");
    setSheetOpen(true);
  }

  function openReactivate() {
    setPendingAction("reactivate");
    setSheetOpen(true);
  }

  function handleStatusConfirm(reason: string) {
    if (!pendingAction || pendingAction === "email" || pendingAction === "password") {
      return;
    }
    const nextStatus = pendingAction === "suspend" ? "suspended" : "active";
    startTransition(async () => {
      setActionError(null);
      const result = await setPlatformShopStatusAction(shop.id, nextStatus, reason);
      if (!result.ok) {
        setActionError("Status konnte nicht geändert werden.");
        return;
      }
      setSheetOpen(false);
      setPendingAction(null);
      router.refresh();
    });
  }

  function handleReasonConfirm(reason: string) {
    if (!pendingAction) {
      return;
    }

    if (pendingAction === "suspend" || pendingAction === "reactivate") {
      handleStatusConfirm(reason);
      return;
    }

    if (pendingAction === "email") {
      startTransition(async () => {
        setActionError(null);
        setCredentialSuccess(null);
        const result = await setPlatformOwnerEmailAction(shop.id, credentialEmail, reason);
        if (!result.ok) {
          setActionError(credentialErrorMessage(result.code));
          return;
        }
        setSheetOpen(false);
        setPendingAction(null);
        setCredentialSuccess("E-Mail wurde aktualisiert.");
        router.refresh();
      });
      return;
    }

    startTransition(async () => {
      setActionError(null);
      setCredentialSuccess(null);
      const result = await setPlatformOwnerPasswordAction(shop.id, newPassword, reason);
      if (!result.ok) {
        setActionError(credentialErrorMessage(result.code));
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      setSheetOpen(false);
      setPendingAction(null);
      setCredentialSuccess("Passwort wurde gesetzt.");
      router.refresh();
    });
  }

  function openEmailChange() {
    setActionError(null);
    setCredentialSuccess(null);
    setPendingAction("email");
    setSheetOpen(true);
  }

  function openPasswordChange() {
    setActionError(null);
    setCredentialSuccess(null);
    if (newPassword.length < 8) {
      setActionError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setActionError("Passwörter stimmen nicht überein.");
      return;
    }
    setPendingAction("password");
    setSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    if (!open) {
      setPendingAction(null);
    }
    setSheetOpen(open);
  }

  function handleCreateInvite() {
    startTransition(async () => {
      setActionError(null);
      const result = await createPlatformOwnerInviteAction(shop.id, inviteEmail);
      if (!result.ok) {
        setActionError("Einladung konnte nicht erstellt werden.");
        return;
      }
      setInviteUrl(buildInviteAbsoluteUrl(result.data.invitePath));
    });
  }

  async function copyInvite() {
    if (!inviteUrl) {
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
  }

  function toggleAllowedTemplate(key: MinisiteTemplate) {
    setAllowedTemplates((current) => {
      const isSelected = current.includes(key);
      if (isSelected && current.length === 1) {
        return current;
      }

      const next = isSelected ? current.filter((item) => item !== key) : [...current, key];
      if (!next.includes(selectedTemplate)) {
        setSelectedTemplate(next[0]!);
      }
      return next;
    });
  }

  function saveTemplateSettings() {
    setTemplateError(null);
    setTemplateSuccess(null);
    startTransition(async () => {
      const result = await setPlatformShopMinisiteTemplatesAction(
        shop.id,
        allowedTemplates,
        selectedTemplate,
      );
      if (!result.ok) {
        setTemplateError("Template-Einstellungen konnten nicht gespeichert werden.");
        return;
      }
      setTemplateSuccess("Freigegebene Templates und aktives Template wurden gespeichert.");
      router.refresh();
    });
  }

  function saveBookingMode() {
    setBookingModeError(null);
    setBookingModeSuccess(null);
    startTransition(async () => {
      const result = await setPlatformShopBookingAutoAssignAction(shop.id, autoAssignBarber);
      if (!result.ok) {
        setBookingModeError("Buchungsmodus konnte nicht gespeichert werden.");
        return;
      }
      setBookingModeSuccess("Buchungsmodus wurde gespeichert.");
      router.refresh();
    });
  }

  function saveMinisiteManaged() {
    setManagedError(null);
    setManagedSuccess(null);
    startTransition(async () => {
      const result = await setPlatformMinisiteManagedAction(shop.id, minisiteManaged);
      if (!result.ok) {
        setManagedError("Einstellung konnte nicht gespeichert werden.");
        return;
      }
      setManagedSuccess(
        minisiteManaged
          ? "Website wird jetzt von Glanzo verwaltet — Inhaber kann nicht mehr bearbeiten."
          : "Inhaber kann die Website wieder selbst bearbeiten.",
      );
      router.refresh();
    });
  }

  const templateSettingsChanged =
    selectedTemplate !== shop.minisite_template ||
    allowedTemplates.slice().sort().join(",") !==
      normalizeAllowedMinisiteTemplates(
        shop.allowed_minisite_templates as MinisiteTemplate[],
        shop.minisite_template as MinisiteTemplate,
      )
        .slice()
        .sort()
        .join(",");

  return (
    <AdminFadeIn className="flex flex-col gap-[var(--space-8)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <AdminPageHero
          kicker="Shop-Detail"
          title={shop.name}
          subtitle={
            <>
              Mini-Site:{" "}
              <a
                href={minisiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brass)] underline-offset-4 hover:underline"
              >
                {shop.slug}
              </a>
            </>
          }
        />
        <div className="flex flex-col items-end gap-[var(--space-3)]">
          <ShopStatusBadge status={shop.status} />
          <Link
            href="/admin/shops"
            className="text-sm text-[var(--text-2)] transition-colors hover:text-[var(--brass)]"
          >
            ← Zur Liste
          </Link>
        </div>
      </div>

      <AdminTabBar
        tabs={[
          { id: "overview", label: "Übersicht" },
          { id: "today", label: "Heute" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "today" ? <AdminShopToday shopId={shop.id} /> : null}

      {tab === "overview" ? (
        <>
          <section
            aria-label="Operational facts"
            className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3"
          >
            <AdminFact label="Inhaber" value={shop.owner_display_name ?? "—"} />
            <AdminFact label="E-Mail" value={shop.owner_email ?? "—"} />
            <AdminFact label="Zeitzone" value={shop.timezone} />
            <AdminFact label="Team" value={String(shop.staff_count)} />
            <AdminFact label="Buchungen 30d" value={String(shop.bookings_last_30d)} />
            <AdminFact label="Erinnerungen" value={shop.reminders_enabled ? "An" : "Aus"} />
            <AdminFact label="Lead-Zeit" value={`${shop.booking_lead_time_min} min`} />
            <AdminFact label="Storno-Fenster" value={`${shop.cancellation_window_min} min`} />
            <AdminFact label="Slot-Raster" value={`${shop.slot_granularity_min} min`} />
            <AdminFact
              label="Direkt buchen"
              value={shop.booking_auto_assign_barber ? "An (ohne Barber)" : "Aus (Barber wählen)"}
            />
            <AdminFact
              label="Mini-Site"
              value={
                <span className="inline-flex items-center gap-[var(--space-2)]">
                  <span>{shop.minisite_template}</span>
                  <span
                    className="inline-block size-3 rounded-full border border-border shadow-[0_0_12px_color-mix(in_oklch,var(--brass)_35%,transparent)]"
                    style={{ backgroundColor: shop.minisite_accent_hex }}
                    aria-hidden
                  />
                </span>
              }
            />
            {shop.dead_outbox_count > 0 ? (
              <AdminFact
                label="Outbox"
                value={<span className="text-[var(--brass)]">{shop.dead_outbox_count} tot</span>}
              />
            ) : null}
          </section>

          <AdminPanel
            title="Website einrichten"
            description="Salon-Website komplett vorbereiten — Bilder, Texte, Template. Der Inhaber öffnet nur die fertige Seite."
          >
            {managedSuccess ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-ok)]">{managedSuccess}</p>
            ) : null}
            {managedError ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-bad)]">{managedError}</p>
            ) : null}

            <div className="flex flex-col gap-[var(--space-4)]">
              <Link
                href={`/admin/shops/${shop.id}/minisite`}
                className="platform-admin-btn-primary inline-flex w-fit items-center justify-center px-[var(--space-4)] py-[var(--space-2)] text-sm"
              >
                Website-Editor öffnen
              </Link>

              <label className="flex cursor-pointer items-start gap-[var(--space-3)] rounded-md border border-[var(--ink-3)] px-[var(--space-4)] py-[var(--space-3)]">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={minisiteManaged}
                  onChange={(event) => setMinisiteManaged(event.target.checked)}
                />
                <span>
                  <span className="block text-sm font-medium text-[var(--text-0)]">
                    Website von Glanzo verwaltet
                  </span>
                  <span className="mt-[var(--space-1)] block text-xs text-[var(--text-2)]">
                    Inhaber sieht keine Bearbeitungs-Tools — nur die live Website. Ideal wenn du alles
                    für ihn einrichtest.
                  </span>
                </span>
              </label>

              <Button
                type="button"
                variant="outline"
                disabled={isPending || minisiteManaged === shop.minisite_managed}
                onClick={saveMinisiteManaged}
              >
                Verwaltungsmodus speichern
              </Button>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Minisite Templates"
            description="Welche Templates der Inhaber wählen darf — und welches aktuell live ist."
          >
            {templateSuccess ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-ok)]">{templateSuccess}</p>
            ) : null}
            {templateError ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-bad)]">{templateError}</p>
            ) : null}

            <div className="space-y-[var(--space-6)]">
              <div>
                <p className="mb-[var(--space-2)] text-sm font-medium text-[var(--text-1)]">
                  Freigegebene Templates
                </p>
                <p className="mb-[var(--space-3)] text-xs text-[var(--text-2)]">
                  Der Inhaber sieht nur diese Vorlagen in seinem Minisite-Editor.
                </p>
                <div className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-3 lg:grid-cols-4">
                  {(Object.keys(MINISITE_TEMPLATES) as MinisiteTemplate[]).map((key) => {
                    const item = MINISITE_TEMPLATES[key];
                    const checked = allowedTemplates.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-start gap-[var(--space-2)] rounded-md border px-[var(--space-3)] py-[var(--space-3)] transition-colors ${
                          checked
                            ? "border-[var(--brass)] bg-[var(--ink-2)]"
                            : "border-[var(--ink-3)] hover:border-[var(--ink-4)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={checked}
                          onChange={() => toggleAllowedTemplate(key)}
                        />
                        <span>
                          <span className="block text-sm font-medium">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-[var(--text-2)]">{key}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-[var(--space-2)] text-sm font-medium text-[var(--text-1)]">Aktives Template</p>
                <p className="mb-[var(--space-3)] text-xs text-[var(--text-2)]">
                  Die öffentliche Mini-Site nutzt dieses Template.
                </p>
                <div className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-3 lg:grid-cols-6">
                  {allowedTemplates.map((key) => {
                    const item = MINISITE_TEMPLATES[key];
                    const active = selectedTemplate === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`rounded-md border px-[var(--space-3)] py-[var(--space-4)] text-left transition-colors ${
                          active
                            ? "border-[var(--brass)] bg-[var(--ink-2)]"
                            : "border-[var(--ink-3)] hover:border-[var(--ink-4)]"
                        }`}
                        onClick={() => setSelectedTemplate(key)}
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        {active ? (
                          <span className="mt-[var(--space-1)] block text-xs text-[var(--brass)]">Live</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-[var(--space-4)]">
              <Button
                type="button"
                variant="outline"
                disabled={isPending || !templateSettingsChanged}
                onClick={saveTemplateSettings}
              >
                Template-Einstellungen speichern
              </Button>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Online-Buchung"
            description="Steuert den öffentlichen Buchungsflow auf der Mini-Site."
          >
            {bookingModeSuccess ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-ok)]">{bookingModeSuccess}</p>
            ) : null}
            {bookingModeError ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-bad)]">{bookingModeError}</p>
            ) : null}
            <label className="flex cursor-pointer items-start gap-[var(--space-3)] rounded-md border border-[var(--ink-3)] px-[var(--space-4)] py-[var(--space-3)]">
              <input
                type="checkbox"
                className="mt-1"
                checked={autoAssignBarber}
                onChange={(e) => setAutoAssignBarber(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-[var(--text-0)]">
                  Direkt buchen (Barber automatisch zuweisen)
                </span>
                <span className="mt-[var(--space-1)] block text-xs text-[var(--text-2)]">
                  Gäste überspringen die Barber-Auswahl — der nächste freie Termin wird zugewiesen.
                </span>
              </span>
            </label>
            <div className="mt-[var(--space-4)]">
              <Button
                type="button"
                variant="outline"
                disabled={isPending || autoAssignBarber === shop.booking_auto_assign_barber}
                onClick={saveBookingMode}
              >
                Buchungsmodus speichern
              </Button>
            </div>
          </AdminPanel>

          <AdminPanel title="Outbox je Vorlage" description="Versand-Health nach E-Mail-Vorlage.">
            {shop.outbox_by_template && Object.keys(shop.outbox_by_template).length > 0 ? (
              <AdminTableShell>
                <OutboxTable outbox={shop.outbox_by_template} />
              </AdminTableShell>
            ) : (
              <AdminEmptyState>Keine Outbox-Daten.</AdminEmptyState>
            )}
          </AdminPanel>

          <AdminPanel
            title={`Audit (${shop.audit_trail.length})`}
            description="Was passiert ist — in Klartext mit den wichtigsten Details."
          >
            {shop.audit_trail.length === 0 ? (
              <AdminEmptyState>Keine Einträge.</AdminEmptyState>
            ) : (
              <AdminAuditTimeline rows={shop.audit_trail} emptyMessage="Keine Einträge." />
            )}
          </AdminPanel>

          <AdminPanel
            title="Inhaber-Zugang"
            description="Login-Daten direkt setzen — ohne altes Passwort. Jede Änderung wird protokolliert."
          >
            {credentialSuccess ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-ok)]">{credentialSuccess}</p>
            ) : null}
            {!hasOwnerAccount ? (
              <AdminEmptyState>
                Noch kein Inhaber-Konto aktiv. Nutze unten die Einladung, damit der Inhaber zuerst beitritt.
              </AdminEmptyState>
            ) : (
              <div className="grid gap-[var(--space-6)] lg:grid-cols-2">
                <div className="flex flex-col gap-[var(--space-3)] rounded-md border border-border/70 bg-[var(--ink-0)]/40 p-[var(--space-4)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-1)]">E-Mail ändern</p>
                    <p className="mt-[var(--space-1)] text-xs text-[var(--text-2)]">
                      Setzt die Login-E-Mail sofort — ohne Bestätigungslink.
                    </p>
                  </div>
                  <Input
                    type="email"
                    value={credentialEmail}
                    onChange={(event) => setCredentialEmail(event.target.value)}
                    className="border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/60 text-sm"
                  />
                  <Button type="button" variant="outline" disabled={isPending} onClick={openEmailChange}>
                    E-Mail speichern
                  </Button>
                </div>

                <div className="flex flex-col gap-[var(--space-3)] rounded-md border border-border/70 bg-[var(--ink-0)]/40 p-[var(--space-4)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-1)]">Passwort setzen</p>
                    <p className="mt-[var(--space-1)] text-xs text-[var(--text-2)]">
                      Neues Passwort vergeben — der Inhaber braucht das alte Passwort nicht.
                    </p>
                  </div>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Neues Passwort"
                    autoComplete="new-password"
                    className="border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/60 text-sm"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Passwort wiederholen"
                    autoComplete="new-password"
                    className="border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/60 text-sm"
                  />
                  <Button type="button" variant="outline" disabled={isPending} onClick={openPasswordChange}>
                    Passwort setzen
                  </Button>
                </div>
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Aktionen" description="Status ändern oder Owner-Einladung neu ausstellen.">
            {actionError ? (
              <p className="mb-[var(--space-3)] text-sm text-[var(--signal-bad)]">{actionError}</p>
            ) : null}
            <div className="flex flex-col gap-[var(--space-6)]">
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {isSuspended ? (
                  <Button type="button" variant="outline" disabled={isPending} onClick={openReactivate}>
                    Reaktivieren
                  </Button>
                ) : (
                  <Button type="button" variant="outline" disabled={isPending} onClick={openSuspend}>
                    Suspendieren
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-[var(--space-2)] rounded-md border border-border/70 bg-[var(--ink-0)]/40 p-[var(--space-4)]">
                <p className="text-sm font-medium text-[var(--text-1)]">Owner-Einladung erneut ausstellen</p>
                <p className="text-xs text-[var(--text-2)]">
                  Link wird einmalig generiert — danach kopieren und manuell senden.
                </p>
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="owner@example.com"
                    className="max-w-sm border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/60 text-sm"
                  />
                  <Button type="button" variant="outline" disabled={isPending} onClick={handleCreateInvite}>
                    Einladung erstellen
                  </Button>
                </div>
                {inviteUrl ? (
                  <div className="flex flex-wrap items-center gap-[var(--space-2)] text-sm">
                    <code className="break-all rounded-md border border-border bg-[var(--ink-1)] px-[var(--space-2)] py-[var(--space-1)] text-xs">
                      {inviteUrl}
                    </code>
                    <Button type="button" size="sm" variant="outline" onClick={() => void copyInvite()}>
                      Kopieren
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </AdminPanel>

          <PlatformReasonSheet
            open={sheetOpen}
            onOpenChange={handleSheetOpenChange}
            title={
              pendingAction === "suspend"
                ? "Shop suspendieren"
                : pendingAction === "reactivate"
                  ? "Shop reaktivieren"
                  : pendingAction === "email"
                    ? "Inhaber-E-Mail ändern"
                    : pendingAction === "password"
                      ? "Inhaber-Passwort setzen"
                      : "Bestätigen"
            }
            description={
              pendingAction === "suspend"
                ? "Mini-Site bleibt live; neue Buchungen werden blockiert; Dashboard wird read-only."
                : pendingAction === "reactivate"
                  ? "Shop wird wieder für Buchungen und Dashboard-Schreibzugriff freigegeben."
                  : pendingAction === "email"
                    ? "Die Login-E-Mail wird sofort ersetzt. Bitte kurz begründen."
                    : pendingAction === "password"
                      ? "Das neue Passwort gilt sofort beim nächsten Login. Bitte kurz begründen."
                      : ""
            }
            confirmLabel={
              pendingAction === "suspend"
                ? "Suspendieren"
                : pendingAction === "reactivate"
                  ? "Reaktivieren"
                  : pendingAction === "email"
                    ? "E-Mail ändern"
                    : pendingAction === "password"
                      ? "Passwort setzen"
                      : "Bestätigen"
            }
            pending={isPending}
            onConfirm={handleReasonConfirm}
          />
        </>
      ) : null}
    </AdminFadeIn>
  );
}

function OutboxTable({
  outbox,
}: {
  outbox: Record<string, { sent?: number; pending?: number; failed?: number; dead?: number }>;
}) {
  return (
    <table className="w-full min-w-[32rem] text-[13px]">
      <thead className="bg-[var(--ink-1)]/80 text-left text-[var(--text-2)]">
        <tr className="h-10">
          <th className="px-[var(--space-4)] font-medium">Vorlage</th>
          <th className="px-[var(--space-4)] font-medium">Gesendet</th>
          <th className="px-[var(--space-4)] font-medium">Ausstehend</th>
          <th className="px-[var(--space-4)] font-medium">Fehlgeschlagen</th>
          <th className="px-[var(--space-4)] font-medium">Tot</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(outbox).map(([template, stats]) => (
          <tr key={template} className="h-10 border-t border-border/70">
            <td className="px-[var(--space-4)] font-medium text-[var(--text-0)]">{template}</td>
            <td className="px-[var(--space-4)] tabular-nums">{stats.sent ?? 0}</td>
            <td className="px-[var(--space-4)] tabular-nums">{stats.pending ?? 0}</td>
            <td className="px-[var(--space-4)] tabular-nums">{stats.failed ?? 0}</td>
            <td className="px-[var(--space-4)] tabular-nums text-[var(--brass)]">{stats.dead ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
