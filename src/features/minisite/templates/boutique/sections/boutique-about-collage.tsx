import Image from "next/image";

import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

import { BoutiqueSectionShell } from "../boutique-section-shell";

type BoutiqueAboutCollageProps = {
  data: ShopPublicData;
};

export function BoutiqueAboutCollage({ data }: BoutiqueAboutCollageProps) {
  const content = data.minisite.content;
  if (content.show?.about === false && content.show?.gallery === false) {
    return null;
  }

  const gallery = content.gallery?.filter(Boolean) ?? [];
  const collagePaths = [
    gallery[0] ?? content.cover_path,
    gallery[1] ?? gallery[0] ?? content.cover_path,
    gallery[2] ?? gallery[1],
    gallery[3] ?? gallery[2],
  ].filter(Boolean) as string[];

  const eyebrow = getBoutiqueSectionField(
    content,
    "about",
    "eyebrow",
    BOUTIQUE_SECTION_META.about.defaults.eyebrow ?? "Über uns",
  );
  const title = getBoutiqueSectionField(
    content,
    "about",
    "title",
    BOUTIQUE_SECTION_META.about.defaults.title ?? "",
  );
  const aboutText = getBoutiqueSectionField(content, "about", "text", content.about?.trim() ?? "");

  if (collagePaths.length === 0 && !aboutText) {
    return null;
  }

  return (
    <section
      id="ms-boutique-about"
      aria-label="Über uns"
      className="ms-boutique-band ms-boutique-band--cream ms-boutique-section ms-cinema-section px-[var(--space-4)] py-[var(--space-12)]"
    >
      <BoutiqueSectionShell className="text-center">
        <p className="ms-boutique-eyebrow ms-boutique-eyebrow--dark">{eyebrow}</p>
        <h2 className="mt-[var(--space-3)] font-display text-3xl text-[color:var(--ms-boutique-ink)]">
          {title}
        </h2>
        {aboutText ? (
          <p className="mx-auto mt-[var(--space-4)] max-w-2xl text-md leading-relaxed text-[color:var(--ms-boutique-ink-muted)]">
            {aboutText}
          </p>
        ) : null}
      </BoutiqueSectionShell>

      {collagePaths.length > 0 ? (
        <div className="mx-auto mt-[var(--space-8)] grid max-w-3xl grid-cols-2 gap-[var(--space-2)]">
          {collagePaths.slice(0, 4).map((path, index) => {
            const url = shopMediaPublicUrl(path);
            if (!url) return null;
            return (
              <figure key={`${path}-${index}`} className="ms-boutique-collage-cell relative aspect-square overflow-hidden">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="ms-boutique-collage-img object-cover"
                />
              </figure>
            );
          })}
        </div>
      ) : null}

      <div className="mt-[var(--space-8)] flex justify-center">
        <a href="#ms-boutique-team" className="ms-boutique-pill-cta ms-boutique-pill-cta--dark">
          Lerne unser Team kennen
        </a>
      </div>
    </section>
  );
}
