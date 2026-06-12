"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { fetchPlatformShopListAction } from "../api";
import type { z } from "zod";

import type { platformShopListItemSchema } from "@/lib/validations/platform-admin";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
        <div>
          <h1 className="text-xl text-[var(--text-0)]">Shops</h1>
          <p className="text-sm text-[var(--text-2)]">Operational contacts and health signals.</p>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name oder Slug suchen…"
          className="max-w-md text-sm"
          aria-label="Shops suchen"
        />
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                "rounded-full border px-[var(--space-3)] py-[var(--space-1)] text-xs",
                status === filter.value
                  ? "border-[var(--text-1)] text-[var(--text-0)]"
                  : "border-border text-[var(--text-2)] hover:text-[var(--text-1)]",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        rows={items}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/shops/${row.id}`)}
        emptyMessage={isPending ? "Laden…" : "Keine Shops gefunden."}
        columns={[
          {
            key: "name",
            header: "Shop",
            cell: (row) => (
              <div>
                <div className="text-[var(--text-0)]">{row.name}</div>
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
                <span className="rounded border border-[var(--brass)]/50 px-[var(--space-2)] py-0.5 text-xs text-[var(--brass)]">
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

      {nextCursor ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => reload({ search: debouncedSearch, status, cursor: nextCursor, append: true })}
          className="self-start rounded-md border border-border px-[var(--space-4)] py-[var(--space-2)] text-sm text-[var(--text-1)] hover:bg-[var(--ink-1)] disabled:opacity-50"
        >
          Mehr laden
        </button>
      ) : null}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
