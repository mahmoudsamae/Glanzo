"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { fetchPlatformShopListAction } from "../api";
import type { z } from "zod";

import type { platformShopListItemSchema } from "@/lib/validations/platform-admin";

import { AdminPageHero } from "./admin-ui";
import { AdminFadeIn, AdminFilterPills, AdminTableShell } from "./admin-ui.client";
import { ShopStatusBadge } from "./shop-status-badge";

type ShopRow = z.infer<typeof platformShopListItemSchema>;

type AdminShopsListProps = {
  initialItems: ShopRow[];
  initialNextCursor: string | null;
  initialSearch?: string;
  initialStatus?: string | null;
};

const STATUS_FILTERS = [
  { value: null, label: "Alle" },
  { value: "active", label: "Aktiv" },
  { value: "suspended", label: "Suspendiert" },
] as const;

export function AdminShopsList({
  initialItems,
  initialNextCursor,
  initialSearch = "",
  initialStatus = null,
}: AdminShopsListProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const reload = useCallback(
    (params: { search: string; status: string | null; cursor?: string | null; append?: boolean }) => {
      startTransition(async () => {
        const result = await fetchPlatformShopListAction({
          search: params.search || undefined,
          status: params.status,
          cursor: params.cursor ?? null,
        });
        if (!result.ok) {
          return;
        }
        setNextCursor(result.data.next_cursor ?? null);
        setItems((current) =>
          params.append ? [...current, ...result.data.items] : result.data.items,
        );
      });
    },
    [],
  );

  useEffect(() => {
    reload({ search: debouncedSearch, status, cursor: null, append: false });
  }, [debouncedSearch, status, reload]);

  return (
    <AdminFadeIn className="flex flex-col gap-[var(--space-8)]">
      <AdminPageHero
        kicker="Shop-Verzeichnis"
        title="Salons"
        subtitle="Status, Inhaber und Gesundheitssignale auf einen Blick — tippe eine Zeile für Details."
      />

      <div className="platform-admin-glass flex flex-col gap-[var(--space-4)] p-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name oder Slug suchen…"
          className="max-w-md border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/50 text-sm"
          aria-label="Shops suchen"
        />
        <AdminFilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
      </div>

      <AdminTableShell>
        <DataTable
          rows={items}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/admin/shops/${row.id}`)}
          emptyMessage={isPending ? "Laden…" : "Keine Shops gefunden."}
          wrapperClassName="border-0"
          columns={[
            {
              key: "name",
              header: "Shop",
              cell: (row) => (
                <div>
                  <div className="font-medium text-[var(--text-0)]">{row.name}</div>
                  <div className="text-[var(--text-2)]">{row.slug}</div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (row) => <ShopStatusBadge status={row.status} />,
            },
            {
              key: "owner",
              header: "Inhaber",
              cell: (row) => (
                <div>
                  <div>{row.owner_display_name ?? "—"}</div>
                  <div className="text-[var(--text-2)]">{row.owner_email ?? "—"}</div>
                </div>
              ),
            },
            {
              key: "staff",
              header: "Team",
              className: "tabular-nums",
              cell: (row) => row.staff_count,
            },
            {
              key: "bookings",
              header: "Buchungen 30d",
              className: "tabular-nums",
              cell: (row) => row.bookings_last_30d,
            },
            {
              key: "outbox",
              header: "Outbox",
              cell: (row) =>
                row.dead_outbox_count > 0 ? (
                  <span className="rounded-full border border-[color-mix(in_oklch,var(--brass)_40%,var(--ink-3))] bg-[color-mix(in_oklch,var(--brass)_10%,var(--ink-1))] px-[var(--space-2)] py-0.5 text-xs text-[var(--brass)]">
                    {row.dead_outbox_count} tot
                  </span>
                ) : (
                  <span className="text-[var(--text-2)]">—</span>
                ),
            },
            {
              key: "created",
              header: "Erstellt",
              cell: (row) => formatDate(row.created_at),
            },
          ]}
        />
      </AdminTableShell>

      {nextCursor ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => reload({ search: debouncedSearch, status, cursor: nextCursor, append: true })}
          className="platform-admin-btn-primary self-start disabled:opacity-50"
        >
          Mehr laden
        </button>
      ) : null}
    </AdminFadeIn>
  );
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
