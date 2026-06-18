import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import { getNicolesSectionField, NICOLES_SECTION_META } from "@/lib/minisite/nicoles-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPillLink } from "../nicoles-pill-link";

type NicolesServicesPreviewProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function NicolesServicesPreview({ data, shopSlug, preview = false }: NicolesServicesPreviewProps) {
  const content = data.minisite.content;
  const anchors = getMinisiteAnchors("nicoles");
  const meta = NICOLES_SECTION_META.services;

  return (
    <section
      id={anchors.services}
      className="ms-nicoles-services-preview ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-4)] py-[var(--space-14)] text-center"
      aria-label="Leistungen"
    >
      <div className="mx-auto max-w-3xl">
        <p className="ms-nicoles-eyebrow">
          {getNicolesSectionField(content, "services", "eyebrow", meta.defaults.eyebrow ?? "")}
        </p>
        <h2 className="ms-nicoles-display mx-auto mt-[var(--space-4)] max-w-2xl font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.15] text-[color:var(--ms-nicoles-ink)]">
          {getNicolesSectionField(content, "services", "title", meta.defaults.title ?? "")}
        </h2>
        <p className="mx-auto mt-[var(--space-5)] max-w-xl text-md leading-relaxed text-[color:var(--ms-nicoles-ink-muted)]">
          {getNicolesSectionField(content, "services", "text", meta.defaults.text ?? "")}
        </p>
        <div className="mt-[var(--space-7)]">
          <NicolesPillLink
            href={preview ? `#${anchors.prices}` : `/s/${shopSlug}/leistungen`}
            label={getNicolesSectionField(content, "services", "cta_label", meta.defaults.cta_label ?? "ZU DEN LEISTUNGEN")}
            preview={preview}
          />
        </div>
      </div>
    </section>
  );
}
