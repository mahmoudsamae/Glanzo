import type { ShopPublicData } from "@/lib/validations/public-shop";
import {
  isBoutiqueSectionVisible,
  resolveBoutiqueSectionOrder,
} from "@/lib/minisite/boutique-sections";

import { BookBarSection } from "../../sections/book-bar";
import { BoutiqueAboutPage } from "./sections/boutique-about-page";
import { BoutiqueGalleryShowcase } from "./sections/boutique-gallery-showcase";
import { BoutiqueGuidelinesPanel } from "./sections/boutique-guidelines-panel";
import { BoutiquePriceBoard } from "./sections/boutique-price-board";
import { BoutiquePromoBand } from "./sections/boutique-promo-band";
import { BoutiqueServicesTiles } from "./sections/boutique-services-tiles";
import { BoutiqueTeamRoster } from "./sections/boutique-team-roster";
import { BoutiqueVisitPanel } from "./sections/boutique-visit-panel";
import { BoutiqueAmbient } from "./boutique-ambient.client";
import { BoutiqueHeroSection } from "./boutique-hero";
import { BoutiqueNav } from "./boutique-nav.client";

type BoutiqueShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function BoutiqueShell({ data, shopSlug, preview = false }: BoutiqueShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";
  const content = data.minisite.content;
  const sectionOrder = resolveBoutiqueSectionOrder(content);

  return (
    <div className="ms-boutique-root relative flex min-h-full flex-1 flex-col">
      <div id="ms-boutique-top" className="pointer-events-none absolute top-0 h-px w-px opacity-0" aria-hidden />
      {preview ? null : <BoutiqueAmbient />}
      <BoutiqueNav
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
        {sectionOrder.map((key) => {
          if (!isBoutiqueSectionVisible(key, content, data)) return null;

          switch (key) {
            case "hero":
              return (
                <BoutiqueHeroSection
                  key="hero"
                  data={data}
                  bookHref={bookHref}
                  preview={preview}
                />
              );
            case "services":
              return <BoutiqueServicesTiles key="services" data={data} />;
            case "about":
              return (
                <BoutiqueAboutPage
                  key="about"
                  data={data}
                  bookHref={bookHref}
                  preview={preview}
                />
              );
            case "promo":
              return (
                <BoutiquePromoBand
                  key="promo"
                  data={data}
                  bookHref={bookHref}
                  preview={preview}
                />
              );
            case "prices":
              return (
                <BoutiquePriceBoard
                  key="prices"
                  services={data.services}
                  content={content}
                />
              );
            case "gallery":
              return <BoutiqueGalleryShowcase key="gallery" content={content} />;
            case "team":
              return (
                <BoutiqueTeamRoster
                  key="team"
                  data={data}
                  bookHrefBase={bookHref}
                  preview={preview}
                />
              );
            case "guidelines":
              return <BoutiqueGuidelinesPanel key="guidelines" content={content} />;
            case "visit":
              return <BoutiqueVisitPanel key="visit" data={data} />;
            default:
              return null;
          }
        })}
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} />}
    </div>
  );
}
