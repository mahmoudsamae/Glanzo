"use client";

import Link from "next/link";

import { DashboardPage, DashboardPageHeader, DashboardPanel } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";

type MinisiteManagedNoticeProps = {
  shopSlug: string;
  shopName: string;
};

export function MinisiteManagedNotice({ shopSlug, shopName }: MinisiteManagedNoticeProps) {
  const viewSiteUrl = buildShopMinisiteUrl(shopSlug);

  return (
    <DashboardPage>
      <DashboardPageHeader
        kicker="Public site"
        title="Deine Website"
        subtitle={`${shopName} — von Glanzo eingerichtet`}
      />
      <DashboardPanel title="Website wird für dich betreut">
        <p className="text-sm leading-relaxed text-[var(--text-2)]">
          Deine öffentliche Mini-Site wurde von uns vollständig eingerichtet — inklusive Bilder,
          Texte und Design. Du musst nichts anpassen: öffne einfach deine Seite oder teile den Link
          mit deinen Kunden.
        </p>
        <p className="mt-[var(--space-3)] text-sm leading-relaxed text-[var(--text-2)]">
          Wenn du Änderungen brauchst, melde dich bei uns — wir aktualisieren alles für dich.
        </p>
        <div className="mt-[var(--space-5)] flex flex-wrap gap-[var(--space-2)]">
          <Button type="button" asChild>
            <Link href={viewSiteUrl} target="_blank" rel="noopener noreferrer">
              Website ansehen
            </Link>
          </Button>
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
