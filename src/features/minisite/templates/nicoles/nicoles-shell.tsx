import type { ShopPublicData } from "@/lib/validations/public-shop";
import {
  isNicolesSectionVisible,
  resolveNicolesHomeSectionOrder,
  type NicolesHomeSectionKey,
} from "@/lib/minisite/nicoles-sections";

import { BookBarSection } from "../../sections/book-bar";
import { NicolesAboutPreview } from "./sections/nicoles-about-preview";
import { NicolesAktionstage } from "./sections/nicoles-aktionstage";
import { NicolesNewsSection } from "./sections/nicoles-news";
import { NicolesPreFooter } from "./sections/nicoles-pre-footer";
import { NicolesSalonBanner } from "./sections/nicoles-salon-banner";
import { NicolesServicesPreview } from "./sections/nicoles-services-preview";
import { NicolesTeamPreview } from "./sections/nicoles-team-preview";
import { NicolesAmbient } from "./nicoles-ambient.client";
import { NicolesFooter } from "./nicoles-footer";
import { NicolesHeroSection } from "./nicoles-hero";
import { NicolesNav } from "./nicoles-nav.client";

type NicolesShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function NicolesShell({ data, shopSlug, preview = false }: NicolesShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";
  const content = data.minisite.content;
  const sectionOrder = resolveNicolesHomeSectionOrder(content);

  function renderSection(key: NicolesHomeSectionKey) {
    if (!isNicolesSectionVisible(key, content)) return null;

    switch (key) {
      case "hero":
        return <NicolesHeroSection key="hero" data={data} />;
      case "about":
        return <NicolesAboutPreview key="about" data={data} shopSlug={shopSlug} preview={preview} />;
      case "salon_banner":
        return <NicolesSalonBanner key="salon_banner" data={data} />;
      case "services":
        return <NicolesServicesPreview key="services" data={data} shopSlug={shopSlug} preview={preview} />;
      case "aktionstage":
        return <NicolesAktionstage key="aktionstage" data={data} />;
      case "team":
        return <NicolesTeamPreview key="team" data={data} preview={preview} />;
      case "news":
        return <NicolesNewsSection key="news" data={data} />;
      case "pre_footer":
        return <NicolesPreFooter key="pre_footer" data={data} />;
      default:
        return null;
    }
  }

  return (
    <div className="ms-nicoles-root relative flex min-h-full flex-1 flex-col">
      {preview ? null : <NicolesAmbient />}
      <NicolesNav
        shopName={data.shop.name}
        content={content}
        bookHref={bookHref}
        preview={preview}
        basePath={preview ? undefined : `/s/${shopSlug}`}
      />
      <main
        className={`relative z-[1] flex w-full flex-1 flex-col ${
          preview
            ? "pb-[var(--space-4)]"
            : "pb-[calc(var(--space-16)+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]"
        }`}
      >
        {sectionOrder.map((key) => renderSection(key))}

        <NicolesFooter data={data} />
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} />}
    </div>
  );
}
