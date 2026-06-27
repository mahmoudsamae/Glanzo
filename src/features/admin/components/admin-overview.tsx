import Link from "next/link";

import type { z } from "zod";

import type { platformOverviewSchema, platformShopListItemSchema } from "@/lib/validations/platform-admin";

import {
  AdminAlertPanel,
  AdminEmptyState,
  AdminPageHero,
  AdminPanel,
  AdminPrimaryLink,
} from "./admin-ui";
import { AdminAuditTimeline, AdminFadeIn, AdminMetricGrid } from "./admin-ui.client";

type Overview = z.infer<typeof platformOverviewSchema>;
type ShopRow = z.infer<typeof platformShopListItemSchema>;

type AdminOverviewProps = {
  overview: Overview;
  suspendedShops: ShopRow[];
};

export function AdminOverview({ overview, suspendedShops }: AdminOverviewProps) {
  const showAlerts = overview.outbox.dead > 0 || suspendedShops.length > 0;

  return (
    <AdminFadeIn className="flex flex-col gap-[var(--space-8)]">
      <AdminPageHero
        kicker="Plattform-Kontrolle"
        title="Übersicht"
        subtitle="Live-Signale über alle Shops — nur aggregierte Kennzahlen, keine Kundendaten."
        action={<AdminPrimaryLink href="/admin/shops/new">Shop anlegen</AdminPrimaryLink>}
      />

      <AdminMetricGrid
        metrics={[
          { label: "Salons aktiv", value: overview.shops.active, accent: "ok" },
          { label: "Suspendiert", value: overview.shops.suspended, accent: "warn" },
          { label: "Anmeldungen 7T", value: overview.signups.last_7d },
          { label: "Buchungen 7d", value: overview.bookings.last_7d },
        ]}
      />

      {showAlerts ? (
        <AdminAlertPanel title="Aufmerksamkeit">
          <ul className="flex flex-col gap-[var(--space-2)]">
            {overview.outbox.dead > 0 ? (
              <li>
                <span className="tabular-nums font-medium text-[var(--text-0)]">{overview.outbox.dead}</span>{" "}
                Benachrichtigungen tot — Shops prüfen
              </li>
            ) : null}
            {suspendedShops.map((shop) => (
              <li key={shop.id}>
                <Link
                  href={`/admin/shops/${shop.id}`}
                  className="font-medium text-[var(--text-0)] underline-offset-4 hover:text-[var(--brass)] hover:underline"
                >
                  {shop.name}
                </Link>{" "}
                <span className="text-[var(--text-2)]">({shop.slug}) — suspendiert</span>
              </li>
            ))}
          </ul>
        </AdminAlertPanel>
      ) : null}

      <AdminPanel
        title="Letzte Plattform-Aktionen"
        description="Was zuletzt auf Plattform-Ebene passiert ist — lesbar statt Roh-Logs."
      >
        {overview.recent_platform_actions.length === 0 ? (
          <AdminEmptyState>Noch keine Einträge — sobald du Shops verwaltest, erscheint hier die Timeline.</AdminEmptyState>
        ) : (
          <AdminAuditTimeline rows={overview.recent_platform_actions} emptyMessage="Noch keine Einträge." />
        )}
      </AdminPanel>
    </AdminFadeIn>
  );
}
