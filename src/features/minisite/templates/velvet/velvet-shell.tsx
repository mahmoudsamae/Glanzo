import type { ShopPublicData } from "@/lib/validations/public-shop";
import {
  isVelvetSectionVisible,
  resolveVelvetHomeSectionOrder,
  type VelvetHomeSectionKey,
} from "@/lib/minisite/velvet-sections";
import { getVelvetI18n } from "@/lib/minisite/velvet-i18n";

import { BookBarSection } from "../../sections/book-bar";
import { VelvetAmbient } from "./velvet-ambient.client";
import { VelvetNav } from "./velvet-nav.client";
import { VelvetHeroSection } from "./velvet-hero";
import { VelvetFooter } from "./velvet-footer";
import { VelvetAboutSection } from "./sections/velvet-about";
import { VelvetServicesSection } from "./sections/velvet-services";
import { VelvetGallerySection } from "./sections/velvet-gallery";
import { VelvetSocialSection } from "./sections/velvet-social";
import { VelvetContactSection } from "./sections/velvet-contact";
import { VelvetBookingCta } from "./sections/velvet-booking-cta";

type VelvetShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function VelvetShell({ data, shopSlug, preview = false }: VelvetShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";
  const content = data.minisite.content;
  const sectionOrder = resolveVelvetHomeSectionOrder(content);
  const i18n = getVelvetI18n(content.locale);

  function renderSection(key: VelvetHomeSectionKey) {
    if (!isVelvetSectionVisible(key, content)) return null;

    switch (key) {
      case "hero":
        return (
          <VelvetHeroSection key="hero" data={data} bookHref={bookHref} preview={preview} i18n={i18n} />
        );
      case "about":
        return (
          <VelvetAboutSection key="about" data={data} shopSlug={shopSlug} preview={preview} i18n={i18n} />
        );
      case "services":
        return (
          <VelvetServicesSection key="services" data={data} shopSlug={shopSlug} preview={preview} i18n={i18n} />
        );
      case "gallery":
        return (
          <VelvetGallerySection key="gallery" data={data} preview={preview} i18n={i18n} />
        );
      case "social":
        return (
          <VelvetSocialSection key="social" data={data} preview={preview} i18n={i18n} />
        );
      case "contact":
        return (
          <VelvetContactSection key="contact" data={data} shopSlug={shopSlug} preview={preview} i18n={i18n} />
        );
      default:
        return null;
    }
  }

  return (
    <div
      className="ms-velvet-root relative flex min-h-full flex-1 flex-col"
      lang={content.locale ?? "de"}
    >
      <VelvetAmbient />
      <VelvetNav
        shopName={data.shop.name}
        content={content}
        bookHref={bookHref}
        preview={preview}
        basePath={preview ? undefined : `/s/${shopSlug}`}
        i18n={i18n}
      />
      <main
        className={`relative z-[1] flex w-full flex-1 flex-col ${
          preview
            ? "pb-[var(--space-4)]"
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]"
        }`}
      >
        {sectionOrder.map((key) => renderSection(key))}

        {!isSuspended && !preview && (
          <VelvetBookingCta bookHref={bookHref} content={content} i18n={i18n} />
        )}

        <VelvetFooter data={data} shopSlug={shopSlug} i18n={i18n} />
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} label={i18n.nav.bookNow} />}
    </div>
  );
}
