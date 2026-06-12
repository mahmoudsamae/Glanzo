import { loadMinisiteEditorData } from "@/server/modules/minisite/minisite.service";
import { requireOwnerDashboardAccess } from "@/server/modules/shops/create-shop.service";

import { MinisiteEditorLoader } from "./minisite-editor-loader.client";

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

  return <MinisiteEditorLoader initial={data} />;
}
