"use client";

import { useEffect, useState, useTransition } from "react";

import { fetchPlatformShopTodayAction } from "../api";
import { normalizeHourlyHistogram } from "@/lib/admin/histogram";
import type { z } from "zod";

import type { platformShopTodaySchema } from "@/lib/validations/platform-admin";

type ShopToday = z.infer<typeof platformShopTodaySchema>;

type AdminShopTodayProps = {
  shopId: string;
};

export function AdminShopToday({ shopId }: AdminShopTodayProps) {
  const [data, setData] = useState<ShopToday | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await fetchPlatformShopTodayAction(shopId);
      if (!result.ok) {
        setError("Heute-Daten konnten nicht geladen werden.");
        return;
      }
      setData(result.data);
    });
  }, [shopId]);

  if (isPending && !data) {
    return <p className="text-sm text-[var(--text-2)]">Laden…</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--brass)]">{error}</p>;
  }

  if (!data) {
    return null;
  }

  const buckets = normalizeHourlyHistogram(data.by_hour);
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <p className="text-sm text-[var(--text-2)]">
        Support-Ansicht — nur Zählungen, keine Namen. Jeder Aufruf wird auditiert (
        <code className="text-xs">platform.support_view</code>).
      </p>
      <div className="rounded-md border border-border bg-[var(--ink-1)]/40 px-[var(--space-4)] py-[var(--space-3)]">
        <p className="text-xs text-[var(--text-2)]">Termine heute ({data.date})</p>
        <p className="mt-[var(--space-1)] text-3xl tabular-nums text-[var(--text-0)]">{data.total}</p>
      </div>
      <div>
        <h3 className="mb-[var(--space-3)] text-sm font-medium text-[var(--text-1)]">Nach Stunde</h3>
        <div className="flex items-end gap-px" style={{ height: "8rem" }}>
          {buckets.map((bucket) => (
            <div
              key={bucket.hour}
              className="flex flex-1 flex-col items-center justify-end gap-[var(--space-1)]"
              title={`${bucket.hour}:00 — ${bucket.count}`}
            >
              <div
                className="w-full rounded-t bg-[var(--ink-3)]"
                style={{ height: `${(bucket.count / maxCount) * 100}%`, minHeight: bucket.count > 0 ? "2px" : 0 }}
              />
              <span className="text-[10px] tabular-nums text-[var(--text-2)]">{bucket.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
