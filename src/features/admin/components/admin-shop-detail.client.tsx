"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPlatformOwnerInviteAction,
  setPlatformShopStatusAction,
} from "../api";
import { buildInviteAbsoluteUrl } from "@/lib/admin/invite-url";
import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";
import type { z } from "zod";

import type { platformShopDetailSchema } from "@/lib/validations/platform-admin";

import { AdminShopToday } from "./admin-shop-today.client";
import { PlatformReasonSheet } from "./platform-reason-sheet.client";
import { ShopStatusBadge } from "./shop-status-badge";
import { cn } from "@/lib/utils";

type ShopDetail = z.infer<typeof platformShopDetailSchema>;

type AdminShopDetailProps = {
  shop: ShopDetail;
};

type DetailTab = "overview" | "today";

export function AdminShopDetail({ shop }: AdminShopDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"suspend" | "reactivate" | null>(null);
  const [ownerEmail, setOwnerEmail] = useState(shop.owner_email ?? "");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const minisiteUrl = buildShopMinisiteUrl(shop.slug);
  const isSuspended = shop.status === "suspended";

  function openSuspend() {
    setPendingAction("suspend");
    setSheetOpen(true);
  }

  function openReactivate() {
    setPendingAction("reactivate");
    setSheetOpen(true);
  }

  function handleStatusConfirm(reason: string) {
    if (!pendingAction) {
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

  function handleCreateInvite() {
    startTransition(async () => {
      setActionError(null);
      const result = await createPlatformOwnerInviteAction(shop.id, ownerEmail);
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

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div>
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <h1 className="text-xl text-[var(--text-0)]">{shop.name}</h1>
            <ShopStatusBadge status={shop.status} />
          </div>
          <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
            <a
              href={minisiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {shop.slug}
            </a>
          </p>
        </div>
        <Link href="/admin/shops" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)]">
          ← Zur Liste
        </Link>
      </div>

      <div className="flex gap-[var(--space-2)] border-b border-border">
        {(
          [
            { id: "overview" as const, label: "Übersicht" },
            { id: "today" as const, label: "Heute" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "border-b-2 px-[var(--space-3)] py-[var(--space-2)] text-sm",
              tab === item.id
                ? "border-[var(--text-0)] text-[var(--text-0)]"
                : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "today" ? <AdminShopToday shopId={shop.id} /> : null}

      {tab === "overview" ? (
        <>
      <section aria-label="Operational facts" className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Inhaber" value={shop.owner_display_name ?? "—"} />
        <Fact label="E-Mail" value={shop.owner_email ?? "—"} />
        <Fact label="Zeitzone" value={shop.timezone} />
        <Fact label="Team" value={String(shop.staff_count)} />
        <Fact label="Buchungen 30d" value={String(shop.bookings_last_30d)} />
        <Fact label="Erinnerungen" value={shop.reminders_enabled ? "An" : "Aus"} />
        <Fact label="Lead-Zeit" value={`${shop.booking_lead_time_min} min`} />
        <Fact label="Storno-Fenster" value={`${shop.cancellation_window_min} min`} />
        <Fact label="Slot-Raster" value={`${shop.slot_granularity_min} min`} />
        <Fact
          label="Mini-Site"
          value={
            <span className="inline-flex items-center gap-[var(--space-2)]">
              <span>{shop.minisite_template}</span>
              <span
                className="inline-block size-3 rounded-full border border-border"
                style={{ backgroundColor: shop.minisite_accent_hex }}
                aria-hidden
              />
            </span>
          }
        />
        {shop.dead_outbox_count > 0 ? (
          <Fact
            label="Outbox"
            value={
              <span className="text-[var(--brass)]">{shop.dead_outbox_count} tot</span>
            }
          />
        ) : null}
      </section>

      <section aria-label="Outbox health">
        <h2 className="mb-[var(--space-3)] text-sm font-medium text-[var(--text-1)]">Outbox je Vorlage</h2>
        {shop.outbox_by_template && Object.keys(shop.outbox_by_template).length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[32rem] text-[13px]">
              <thead className="bg-[var(--ink-1)] text-left text-[var(--text-2)]">
                <tr className="h-8">
                  <th className="px-[var(--space-3)] font-medium">Vorlage</th>
                  <th className="px-[var(--space-3)] font-medium">Gesendet</th>
                  <th className="px-[var(--space-3)] font-medium">Ausstehend</th>
                  <th className="px-[var(--space-3)] font-medium">Fehlgeschlagen</th>
                  <th className="px-[var(--space-3)] font-medium">Tot</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(shop.outbox_by_template).map(([template, stats]) => (
                  <tr key={template} className="h-8 border-t border-border">
                    <td className="px-[var(--space-3)]">{template}</td>
                    <td className="px-[var(--space-3)] tabular-nums">{stats.sent ?? 0}</td>
                    <td className="px-[var(--space-3)] tabular-nums">{stats.pending ?? 0}</td>
                    <td className="px-[var(--space-3)] tabular-nums">{stats.failed ?? 0}</td>
                    <td className="px-[var(--space-3)] tabular-nums">{stats.dead ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-2)]">Keine Outbox-Daten.</p>
        )}
      </section>

      <section aria-label="Audit trail">
        <h2 className="mb-[var(--space-3)] text-sm font-medium text-[var(--text-1)]">Audit (20)</h2>
        {shop.audit_trail.length === 0 ? (
          <p className="text-sm text-[var(--text-2)]">Keine Einträge.</p>
        ) : (
          <ul className="flex flex-col gap-[var(--space-2)] text-[13px]">
            {shop.audit_trail.map((row, index) => (
              <li key={`${row.action}-${index}`} className="rounded-md border border-border p-[var(--space-3)]">
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                  <span className="text-[var(--text-0)]">{String(row.action ?? "—")}</span>
                  <span className="text-[var(--text-2)]">
                    {row.created_at ? formatAuditTime(String(row.created_at)) : "—"}
                  </span>
                </div>
                <p className="text-[var(--text-2)]">{String(row.entity ?? "")}</p>
                {row.diff ? (
                  <details className="mt-[var(--space-2)]">
                    <summary className="cursor-pointer text-[var(--text-2)]">Diff</summary>
                    <pre className="mt-[var(--space-2)] overflow-x-auto text-xs text-[var(--text-2)]">
                      {JSON.stringify(row.diff, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Actions" className="rounded-md border border-border p-[var(--space-4)]">
        <h2 className="mb-[var(--space-4)] text-sm font-medium text-[var(--text-1)]">Aktionen</h2>
        {actionError ? <p className="mb-[var(--space-3)] text-sm text-[var(--brass)]">{actionError}</p> : null}
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

          <div className="flex flex-col gap-[var(--space-2)]">
            <p className="text-sm text-[var(--text-2)]">Owner-Einladung erneut ausstellen</p>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              <Input
                type="email"
                value={ownerEmail}
                onChange={(event) => setOwnerEmail(event.target.value)}
                placeholder="owner@example.com"
                className="max-w-sm text-sm"
              />
              <Button type="button" variant="outline" disabled={isPending} onClick={handleCreateInvite}>
                Einladung erstellen
              </Button>
            </div>
            {inviteUrl ? (
              <div className="flex flex-wrap items-center gap-[var(--space-2)] text-sm">
                <code className="break-all rounded bg-[var(--ink-1)] px-[var(--space-2)] py-[var(--space-1)]">
                  {inviteUrl}
                </code>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyInvite()}>
                  Kopieren
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <PlatformReasonSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={pendingAction === "suspend" ? "Shop suspendieren" : "Shop reaktivieren"}
        description={
          pendingAction === "suspend"
            ? "Mini-Site bleibt live; neue Buchungen werden blockiert; Dashboard wird read-only."
            : "Shop wird wieder für Buchungen und Dashboard-Schreibzugriff freigegeben."
        }
        confirmLabel={pendingAction === "suspend" ? "Suspendieren" : "Reaktivieren"}
        pending={isPending}
        onConfirm={handleStatusConfirm}
      />
        </>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-[var(--ink-1)]/40 px-[var(--space-3)] py-[var(--space-2)]">
      <p className="text-xs text-[var(--text-2)]">{label}</p>
      <div className="mt-[var(--space-1)] text-sm text-[var(--text-0)]">{value}</div>
    </div>
  );
}

function formatAuditTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}
