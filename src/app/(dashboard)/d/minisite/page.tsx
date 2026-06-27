import { MinisiteEditorLoader } from "./minisite-editor-loader.client";
import { MinisiteManagedNotice } from "@/features/minisite";
import { loadMinisiteEditorData } from "@/server/modules/minisite/minisite.service";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

export default async function MinisitePage() {
  const { actor, shopId } = await requireOwnerDashboardAccess();
  const data = await loadMinisiteEditorData(actor, shopId);

  if (!data) {
    return (
      <div className="px-[var(--space-4)] py-[var(--space-12)] text-center text-[var(--text-2)]">
        Minisite konnte nicht geladen werden.
      </div>
    );
  }

  if (data.minisiteManaged) {
    return <MinisiteManagedNotice shopSlug={data.shopSlug} shopName={data.publicData.shop.name} />;
  }

  return <MinisiteEditorLoader initial={data} />;
}
