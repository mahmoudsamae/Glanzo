import Image from "next/image";

import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

import { BookCta } from "../../../sections/book-cta";

type BoutiquePromoBandProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
};

export function BoutiquePromoBand({ data, bookHref, preview = false }: BoutiquePromoBandProps) {
  const content = data.minisite.content;
  const isSuspended = data.shop.status === "suspended";
  const coverUrl =
    content.show?.cover !== false && content.cover_path ? shopMediaPublicUrl(content.cover_path) : null;
  const eyebrow = getBoutiqueSectionField(
    content,
    "promo",
    "eyebrow",
    BOUTIQUE_SECTION_META.promo.defaults.eyebrow ?? "Termin sichern",
  );
  const title = getBoutiqueSectionField(
    content,
    "promo",
    "title",
    BOUTIQUE_SECTION_META.promo.defaults.title ?? "Dein Slot wartet — online in Sekunden.",
  );
  const notice = getBoutiqueSectionField(
    content,
    "promo",
    "text",
    content.booking_notice?.trim() || BOUTIQUE_SECTION_META.promo.defaults.text || "",
  );

  return (
    <section
      aria-label="Aktion"
      className="ms-boutique-promo ms-boutique-section ms-cinema-section relative overflow-hidden py-[var(--space-16)]"
    >
      {coverUrl ? (
        <Image src={coverUrl} alt="" fill sizes="100vw" className="ms-boutique-promo-bg object-cover" />
      ) : (
        <div className="ms-boutique-promo-bg ms-boutique-promo-bg--fallback absolute inset-0" aria-hidden />
      )}
      <div className="ms-boutique-promo-overlay absolute inset-0" aria-hidden />

      <div className="relative z-10 px-[var(--space-4)]">
        <div className="mx-auto max-w-xl">
          <div className="ms-boutique-promo-box">
            <p className="ms-boutique-eyebrow text-center">{eyebrow}</p>
            <h2 className="mt-[var(--space-3)] text-center font-display text-2xl text-[color:var(--ms-boutique-cream)]">
              {title}
            </h2>
            <p className="mt-[var(--space-3)] text-center text-md text-[color:color-mix(in_oklch,var(--ms-boutique-cream)_85%,transparent)]">
              {notice}
            </p>
            <div className="mt-[var(--space-5)] flex justify-center">
              {isSuspended ? (
                <p className="text-sm text-[color:var(--ms-boutique-cream)]">Derzeit keine Online-Buchungen.</p>
              ) : preview ? (
                <span className="ms-boutique-pill-cta">Jetzt buchen</span>
              ) : (
                <BookCta href={bookHref} label="Jetzt buchen" suspended={isSuspended} className="ms-boutique-pill-cta" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
