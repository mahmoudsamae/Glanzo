import type { ShopPublicData } from "@/lib/validations/public-shop";
import {
  isForgeSectionVisible,
  resolveForgeHomeSectionOrder,
  type ForgeHomeSectionKey,
} from "@/lib/minisite/forge-sections";
import { nextForgeHomeSectionHash } from "@/lib/minisite/forge-section-scroll";

import { BookBarSection } from "../../sections/book-bar";
import { NicolesAktionstage } from "../nicoles/sections/nicoles-aktionstage";
import { NicolesPreFooter } from "../nicoles/sections/nicoles-pre-footer";
import { ForgeFooter } from "./forge-footer.client";
import { NicolesNav } from "../nicoles/nicoles-nav.client";
import { ForgeAmbient } from "./forge-ambient.client";
import { ForgeHeroSection } from "./forge-hero";
import { ForgeScrollCue } from "./forge-scroll-cue";
import { ForgeAboutSection } from "./sections/forge-about";
import { ForgeNewsSection } from "./sections/forge-news";
import { ForgeSalonBanner } from "./sections/forge-salon-banner";
import { ForgeServicesPreview } from "./sections/forge-services-preview";

type ForgeShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function ForgeShell({ data, shopSlug, preview = false }: ForgeShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";
  const content = data.minisite.content;
  const sectionOrder = resolveForgeHomeSectionOrder(content);
  const visibleSections = sectionOrder.filter((key) => isForgeSectionVisible(key, content));

  function renderSection(key: ForgeHomeSectionKey) {
    if (!isForgeSectionVisible(key, content)) return null;

    switch (key) {
      case "hero":
        return <ForgeHeroSection key="hero" data={data} />;
      case "about":
        return <ForgeAboutSection key="about" data={data} shopSlug={shopSlug} preview={preview} />;
      case "salon_banner":
        return <ForgeSalonBanner key="salon_banner" data={data} />;
      case "services":
        return <ForgeServicesPreview key="services" data={data} shopSlug={shopSlug} preview={preview} />;
      case "aktionstage":
        return <NicolesAktionstage key="aktionstage" data={data} />;
      case "news":
        return <ForgeNewsSection key="news" data={data} />;
      case "pre_footer":
        return <NicolesPreFooter key="pre_footer" data={data} />;
      default:
        return null;
    }
  }

  return (
    <div className="ms-forge-root relative flex min-h-full flex-1 flex-col">
      {preview ? null : <ForgeAmbient />}
      <NicolesNav
        shopName={data.shop.name}
        content={content}
        bookHref={bookHref}
        preview={preview}
        basePath={preview ? undefined : `/s/${shopSlug}`}
        template="forge"
      />
      <main
        className={`relative z-[1] flex w-full flex-1 flex-col ${
          preview
            ? "pb-[var(--space-4)]"
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]"
        }`}
      >
        {visibleSections.map((key) => (
          <div
            key={key}
            className={key === "hero" ? undefined : "ms-forge-section-stack"}
          >
            {renderSection(key)}
            {key === "hero" ? null : (
              <ForgeScrollCue
                href={nextForgeHomeSectionHash(visibleSections, key)}
                className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end"
              />
            )}
          </div>
        ))}
        <ForgeFooter data={data} />
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} />}
    </div>
  );
}
