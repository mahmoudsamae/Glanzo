import Image from "next/image";

import {
  BOUTIQUE_SECTION_META,
  getBoutiqueGalleryLayout,
  getBoutiqueSectionField,
} from "@/lib/minisite/boutique-sections";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

type BoutiqueGalleryShowcaseProps = {
  content: MinisiteContent;
};

export function BoutiqueGalleryShowcase({ content }: BoutiqueGalleryShowcaseProps) {
  if (content.show?.gallery === false) {
    return null;
  }

  const paths = content.gallery?.filter(Boolean) ?? [];
  if (paths.length === 0) {
    return null;
  }

  const layout = getBoutiqueGalleryLayout(content);
  const eyebrow = getBoutiqueSectionField(
    content,
    "gallery",
    "eyebrow",
    BOUTIQUE_SECTION_META.gallery.defaults.eyebrow ?? "Fotogalerie",
  );
  const title = getBoutiqueSectionField(
    content,
    "gallery",
    "title",
    BOUTIQUE_SECTION_META.gallery.defaults.title ?? "",
  );
  const loopPaths = layout === "filmstrip" && paths.length > 1 ? [...paths, ...paths] : paths;

  return (
    <section
      id="ms-boutique-gallery"
      aria-label="Galerie"
      className="ms-boutique-band ms-boutique-band--dark ms-boutique-section ms-cinema-section overflow-hidden py-[var(--space-12)]"
    >
      <div className="px-[var(--space-4)] text-center">
        <p className="ms-boutique-eyebrow">{eyebrow}</p>
        <h2 className="mt-[var(--space-3)] font-display text-2xl text-[color:var(--ms-boutique-cream)] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-[var(--space-2)] text-sm text-[color:color-mix(in_oklch,var(--ms-boutique-cream)_72%,transparent)]">
          {paths.length} {paths.length === 1 ? "Foto" : "Fotos"}
          {layout === "filmstrip" ? <span className="md:hidden"> · Wischen zum Blättern</span> : null}
        </p>
      </div>

      {layout === "grid" ? (
        <div className="mx-auto mt-[var(--space-8)] grid max-w-3xl grid-cols-2 gap-[var(--space-2)] px-[var(--space-4)]">
          {paths.map((path, index) => {
            const url = shopMediaPublicUrl(path);
            if (!url) return null;
            return (
              <figure key={`${path}-${index}`} className="relative aspect-square overflow-hidden">
                <Image src={url} alt="" fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
              </figure>
            );
          })}
        </div>
      ) : (
        <div className="ms-boutique-gallery-marquee mt-[var(--space-8)]">
          <div className="ms-boutique-gallery-track">
            {loopPaths.map((path, index) => {
              const url = shopMediaPublicUrl(path);
              if (!url) return null;
              return (
                <figure key={`${path}-${index}`} className="ms-boutique-gallery-slide relative shrink-0">
                  <Image src={url} alt="" fill sizes="240px" className="object-cover" />
                </figure>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
