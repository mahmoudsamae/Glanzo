import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import { getNicolesSectionField, NICOLES_SECTION_META } from "@/lib/minisite/nicoles-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { nicolesAboutPhotos, NicolesPhoto } from "../nicoles-media";
import { NicolesPillLink } from "../nicoles-pill-link";

type NicolesAboutPreviewProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function NicolesAboutPreview({ data, shopSlug, preview = false }: NicolesAboutPreviewProps) {
  const content = data.minisite.content;
  const anchors = getMinisiteAnchors("nicoles");
  const meta = NICOLES_SECTION_META.about;
  const [photoA, photoB] = nicolesAboutPhotos(content);

  return (
    <section
      id={anchors.about}
      className="ms-nicoles-about-preview ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-5)] py-[var(--space-12)] sm:px-[var(--space-6)]"
      aria-label="Über uns Vorschau"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-[var(--space-8)] lg:grid-cols-2 lg:gap-[var(--space-10)]">
        <div>
          <p className="ms-nicoles-eyebrow">{getNicolesSectionField(content, "about", "eyebrow", meta.defaults.eyebrow ?? "")}</p>
          <h2 className="ms-nicoles-display mt-[var(--space-4)] font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12] text-[color:var(--ms-nicoles-ink)]">
            {getNicolesSectionField(content, "about", "title", meta.defaults.title ?? "")}
          </h2>
          <p className="mt-[var(--space-5)] max-w-lg text-md leading-relaxed text-[color:var(--ms-nicoles-ink-muted)]">
            {getNicolesSectionField(content, "about", "text", meta.defaults.text ?? "")}
          </p>
          <div className="mt-[var(--space-6)]">
            <NicolesPillLink
              href={preview ? `#${anchors.about}` : `/s/${shopSlug}/about`}
              label={getNicolesSectionField(content, "about", "cta_label", meta.defaults.cta_label ?? "MEHR ÜBER UNS")}
              preview={preview}
            />
          </div>
        </div>

        <div className="ms-nicoles-about-portraits relative mx-auto flex w-full max-w-md items-end justify-center gap-[var(--space-3)]">
          <div className="relative aspect-[3/4] w-[42%] overflow-hidden bg-[color:var(--ms-border-subtle)]">
            <NicolesPhoto path={photoA} sizes="200px" />
          </div>
          <div className="relative aspect-[3/5] w-[48%] overflow-hidden bg-[color:var(--ms-border-subtle)] sm:-mb-[var(--space-6)]">
            <NicolesPhoto path={photoB} sizes="220px" />
          </div>
        </div>
      </div>
    </section>
  );
}
