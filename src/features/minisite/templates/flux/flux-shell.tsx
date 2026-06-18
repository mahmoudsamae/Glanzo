import type { ShopPublicData } from "@/lib/validations/public-shop";

import { FluxBookDock } from "./sections/flux-book-dock";
import { FluxGalleryStrip } from "./sections/flux-gallery-strip";
import { FluxGuidelinesChips } from "./sections/flux-guidelines-chips";
import { FluxInfoBento } from "./sections/flux-info-bento";
import { FluxPriceRail } from "./sections/flux-price-rail";
import { FluxTeamRail } from "./sections/flux-team-rail";
import { FluxAmbient } from "./flux-ambient.client";
import { FluxHeroSection } from "./flux-hero";

type FluxShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function FluxShell({ data, shopSlug, preview = false }: FluxShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";

  return (
    <div className="ms-flux-root relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      {preview ? null : <FluxAmbient />}
      <main
        className={`relative z-[1] flex w-full flex-1 flex-col ${
          preview
            ? "pb-[var(--space-4)]"
            : "pb-[calc(var(--space-20)+env(safe-area-inset-bottom))]"
        }`}
      >
        <FluxHeroSection data={data} bookHref={bookHref} preview={preview} />
        <FluxTeamRail data={data} bookHrefBase={bookHref} preview={preview} />
        <FluxPriceRail services={data.services} content={data.minisite.content} />
        <FluxInfoBento data={data} />
        <FluxGalleryStrip content={data.minisite.content} />
        <FluxGuidelinesChips content={data.minisite.content} />
      </main>
      {preview ? null : <FluxBookDock bookHref={bookHref} suspended={isSuspended} />}
    </div>
  );
}
