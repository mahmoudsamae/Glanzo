import Link from "next/link";

import type { z } from "zod";

import type { platformOverviewSchema, platformShopListItemSchema } from "@/lib/validations/platform-admin";

type Overview = z.infer<typeof platformOverviewSchema>;
type ShopRow = z.infer<typeof platformShopListItemSchema>;

type AdminOverviewProps = {
  overview: Overview;
  suspendedShops: ShopRow[];
};

export function AdminOverview({ overview, suspendedShops }: AdminOverviewProps) {
  const showAlerts = overview.outbox.dead > 0 || suspendedShops.length > 0;

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
        <div>
          <h1 className="text-xl text-[var(--text-0)]">Platform</h1>
          <p className="text-sm text-[var(--text-2)]">Operational overview — aggregates only.</p>
        </div>
        <Link
          href="/admin/shops/new"
          className="inline-flex min-h-9 items-center rounded-md border border-border bg-[var(--ink-2)] px-[var(--space-3)] text-sm text-[var(--text-1)] hover:bg-[var(--ink-3)]"
        >
          Shop anlegen
        </Link>
      </div>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
        <MetricCard label="Shops aktiv" value={overview.shops.active} />
        <MetricCard label="Suspendiert" value={overview.shops.suspended} />
        <MetricCard label="Signups 7d" value={overview.signups.last_7d} />
        <MetricCard label="Buchungen 7d" value={overview.bookings.last_7d} />
      </section>

      {showAlerts ? (
        <section
          aria-label="Alerts"
          className="rounded-md border border-[var(--brass)]/40 bg-[var(--brass)]/5 p-[var(--space-4)] text-sm"
        >
          <h2 className="mb-[var(--space-3)] font-medium text-[var(--brass)]">Aufmerksamkeit</h2>
          <ul className="flex flex-col gap-[var(--space-2)] text-[var(--text-1)]">
            {overview.outbox.dead > 0 ? (
              <li>
                <span className="tabular-nums">{overview.outbox.dead}</span> Benachrichtigungen tot — Shops
                prüfen
              </li>
            ) : null}
            {suspendedShops.map((shop) => (
              <li key={shop.id}>
                <Link href={`/admin/shops/${shop.id}`} className="underline-offset-4 hover:underline">
                  {shop.name}
                </Link>{" "}
                <span className="text-[var(--text-2)]">({shop.slug}) — suspendiert</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Recent platform actions">
        <h2 className="mb-[var(--space-3)] text-sm font-medium text-[var(--text-1)]">Letzte Plattform-Aktionen</h2>
        {overview.recent_platform_actions.length === 0 ? (
          <p className="text-sm text-[var(--text-2)]">Noch keine Einträge.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[28rem] text-[13px]">
              <thead className="bg-[var(--ink-1)] text-left text-[var(--text-2)]">
                <tr className="h-8">
                  <th className="px-[var(--space-3)] font-medium">Zeit</th>
                  <th className="px-[var(--space-3)] font-medium">Aktion</th>
                  <th className="px-[var(--space-3)] font-medium">Entität</th>
                </tr>
              </thead>
              <tbody>
                {overview.recent_platform_actions.map((row, index) => {
                  const action = String(row.action ?? "—");
                  const entity = String(row.entity ?? "—");
                  const createdAt = row.created_at ? formatAuditTime(String(row.created_at)) : "—";
                  return (
                    <tr key={`${action}-${index}`} className="h-8 border-t border-border">
                      <td className="px-[var(--space-3)] text-[var(--text-2)]">{createdAt}</td>
                      <td className="px-[var(--space-3)] text-[var(--text-1)]">{action}</td>
                      <td className="px-[var(--space-3)] text-[var(--text-2)]">{entity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-[var(--ink-1)] px-[var(--space-4)] py-[var(--space-3)]">
      <p className="text-xs text-[var(--text-2)]">{label}</p>
      <p className="mt-[var(--space-1)] text-2xl tabular-nums text-[var(--text-0)]">{value}</p>
    </div>
  );
}

function formatAuditTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
