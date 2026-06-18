import Image from "next/image";

import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";

import { BookCta } from "../../sections/book-cta";

type BoutiqueHeroProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
};

export function BoutiqueHeroSection({ data, bookHref, preview = false }: BoutiqueHeroProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const isSuspended = shop.status === "suspended";
  const coverUrl =
    content.show?.cover !== false && content.cover_path ? shopMediaPublicUrl(content.cover_path) : null;
  const headline = getBoutiqueSectionField(
    content,
    "hero",
    "title",
    content.hero_headline?.trim() || shop.name,
  );
  const welcome = getBoutiqueSectionField(
    content,
    "hero",
    "text",
    BOUTIQUE_SECTION_META.hero.defaults.text ?? "",
  );
  const eyebrow = getBoutiqueSectionField(content, "hero", "eyebrow", BOUTIQUE_SECTION_META.hero.defaults.eyebrow ?? "Willkommen");

  return (
    <section
      id="ms-boutique-top"
      className="ms-boutique-hero ms-boutique-hero--boutique ms-cinema-hero relative min-h-[min(88vh,44rem)] overflow-hidden"
      data-boutique-hero
      aria-label="Hero"
    >
      {coverUrl ? (
        <div className="ms-boutique-hero-media absolute inset-0">
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="ms-boutique-hero-bg ms-cinema-cover object-cover"
          />
        </div>
      ) : (
        <div className="ms-boutique-hero-media ms-boutique-hero-media--fallback absolute inset-0" aria-hidden />
      )}

      <div className="ms-boutique-hero-overlay pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex min-h-[inherit] flex-col items-end justify-end px-[var(--space-6)] py-[var(--space-12)] sm:px-[var(--space-10)]">
        <div className="max-w-lg">
          <p className="ms-boutique-eyebrow mb-[var(--space-2)] drop-shadow-sm">{eyebrow}</p>
          <h1 className="font-display text-3xl leading-tight text-[color:var(--ms-boutique-cream)] drop-shadow-md sm:text-4xl lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-[var(--space-3)] text-base leading-relaxed text-[color:color-mix(in_oklch,var(--ms-boutique-cream)_90%,transparent)] drop-shadow-sm">
            {welcome}
          </p>
          <div className="mt-[var(--space-5)]">
            {isSuspended ? (
              <p className="text-sm text-[color:var(--ms-boutique-cream)]">Online-Buchung pausiert</p>
            ) : preview ? (
              <span className="ms-boutique-pill-cta">Jetzt Termin</span>
            ) : (
              <BookCta
                href={bookHref}
                label="Jetzt Termin"
                suspended={isSuspended}
                className="ms-boutique-pill-cta"
              />
            )}
          </div>
        </div>

        <a
          href="#ms-boutique-services"
          className="ms-boutique-scroll-cue absolute bottom-[var(--space-6)] left-1/2 -translate-x-1/2"
          aria-label="Weiter scrollen"
        >
          ↓
        </a>
      </div>
    </section>
  );
}
