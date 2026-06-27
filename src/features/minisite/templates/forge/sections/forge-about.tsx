import { resolveForgeAboutImages } from "@/lib/minisite/forge-media";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import { getForgeSectionField, FORGE_SECTION_META } from "@/lib/minisite/forge-sections";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../../nicoles/nicoles-media";
import { NicolesPillLink } from "../../nicoles/nicoles-pill-link";
import { ForgeShineFrame } from "../forge-shine-frame";

type ForgeAboutSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function ForgeAboutSection({ data, shopSlug, preview = false }: ForgeAboutSectionProps) {
  const content = data.minisite.content;
  const anchors = getMinisiteAnchors("forge");
  const meta = FORGE_SECTION_META.about;
  const [photoA, photoB] = resolveForgeAboutImages(content);
  const hasImages = Boolean(photoA || photoB);

  return (
    <section
      id={anchors.about}
      className="ms-forge-about ms-forge-section ms-cinema-section"
      aria-label="Über uns Vorschau"
    >
      <div className="ms-forge-about-grid">
        <div {...forgeReveal("left", 0)}>
          <p className="ms-forge-eyebrow">
            {getForgeSectionField(content, "about", "eyebrow", meta.defaults.eyebrow ?? "")}
          </p>
          <h2 className="ms-forge-section-title mt-[var(--space-4)]">
            {getForgeSectionField(content, "about", "title", meta.defaults.title ?? "")}
          </h2>
          <p className="ms-forge-section-text mt-[var(--space-5)] max-w-lg">
            {getForgeSectionField(content, "about", "text", meta.defaults.text ?? "")}
          </p>
          <div className="mt-[var(--space-6)]">
            <NicolesPillLink
              href={preview ? `#${anchors.about}` : `/s/${shopSlug}/about`}
              label={getForgeSectionField(content, "about", "cta_label", meta.defaults.cta_label ?? "MEHR ÜBER UNS")}
              preview={preview}
            />
          </div>
        </div>

        {hasImages ? (
          <div {...forgeReveal("right", 120)} className="ms-forge-about-media" data-forge-stagger>
            {photoA ? (
              <ForgeShineFrame
                variant="media"
                className={forgeReveal("scale", 0, "ms-forge-about-photo ms-forge-about-photo--a").className}
                style={forgeReveal("scale", 0).style}
              >
                <NicolesPhoto path={photoA} sizes="(min-width:1024px) 280px, 42vw" />
              </ForgeShineFrame>
            ) : null}
            {photoB ? (
              <ForgeShineFrame
                variant="media"
                className={forgeReveal("scale", 100, "ms-forge-about-photo ms-forge-about-photo--b").className}
                style={forgeReveal("scale", 100).style}
              >
                <NicolesPhoto path={photoB} sizes="(min-width:1024px) 300px, 48vw" />
              </ForgeShineFrame>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
