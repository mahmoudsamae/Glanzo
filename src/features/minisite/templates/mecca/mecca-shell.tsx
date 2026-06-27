import type { ShopPublicData } from "@/lib/validations/public-shop";
import {
  isMeccaSectionVisible,
  resolveMeccaHomeSectionOrder,
  type MeccaHomeSectionKey,
} from "@/lib/minisite/mecca-sections";

import { BookBarSection } from "../../sections/book-bar";
import { MeccaAboutSection } from "./sections/mecca-about";
import { MeccaContactSection } from "./sections/mecca-contact";
import { MeccaGallerySection } from "./sections/mecca-gallery";
import { MeccaHeroSection } from "./mecca-hero";
import { MeccaReviewsSection } from "./sections/mecca-reviews";
import { MeccaServicesSection } from "./sections/mecca-services";
import { MeccaAmbient } from "./mecca-ambient.client";
import { MeccaFooter } from "./mecca-footer";
import { MeccaNav } from "./mecca-nav.client";

type MeccaShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function MeccaShell({ data, shopSlug, preview = false }: MeccaShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";
  const content = data.minisite.content;
  const sectionOrder = resolveMeccaHomeSectionOrder(content);

  function renderSection(key: MeccaHomeSectionKey) {
    if (!isMeccaSectionVisible(key, content)) return null;

    switch (key) {
      case "hero":
        return <MeccaHeroSection key="hero" data={data} bookHref={bookHref} preview={preview} />;
      case "about":
        return (
          <MeccaAboutSection key="about" data={data} shopSlug={shopSlug} preview={preview} />
        );
      case "services":
        return (
          <MeccaServicesSection key="services" data={data} shopSlug={shopSlug} preview={preview} />
        );
      case "gallery":
        return <MeccaGallerySection key="gallery" data={data} preview={preview} />;
      case "reviews":
        return <MeccaReviewsSection key="reviews" data={data} />;
      case "contact":
        return (
          <MeccaContactSection key="contact" data={data} shopSlug={shopSlug} preview={preview} />
        );
      default:
        return null;
    }
  }

  return (
    <div className="ms-mecca-root relative flex min-h-full flex-1 flex-col">
      <MeccaAmbient />
      <MeccaNav
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
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]"
        }`}
      >
        {sectionOrder.map((key) => renderSection(key))}

        <MeccaFooter data={data} />
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} />}
    </div>
  );
}
