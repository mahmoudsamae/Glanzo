import Link from "next/link";

import { DashboardPanel } from "@/components/dashboard";
import { MinisitePageSettings } from "@/features/minisite";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";
import { loadMinisiteEditorData } from "@/server/modules/minisite/minisite.service";

export default async function WebsiteSettingsPage() {
  const { actor, shopId } = await requireOwnerDashboardAccess();
  const data = await loadMinisiteEditorData(actor, shopId);

  if (!data) {
    return (
      <DashboardPanel title="Website">
        <p className="text-sm text-[var(--text-2)]">Mini-Site konnte nicht geladen werden.</p>
      </DashboardPanel>
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <DashboardPanel
        title="Öffentliche Mini-Site"
        description="Steuere sichtbare Bereiche und Gäste-Hinweise. Design (Vorlage, Farbe, Medien) bearbeitest du im Minisite-Editor."
      >
        <Link
          href="/d/minisite"
          className="inline-flex text-sm font-medium text-[var(--brass)] underline-offset-4 hover:underline"
        >
          Minisite-Editor öffnen →
        </Link>
      </DashboardPanel>
      <MinisitePageSettings initial={data} showDesignLink={false} />
    </div>
  );
}
