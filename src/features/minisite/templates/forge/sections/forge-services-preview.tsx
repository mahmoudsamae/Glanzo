import { forgeReveal } from "@/lib/minisite/forge-motion";
import { getForgeSectionField, FORGE_SECTION_META } from "@/lib/minisite/forge-sections";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPillLink } from "../../nicoles/nicoles-pill-link";
import { ForgeServiceCard } from "./forge-service-card";

type ForgeServicesPreviewProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function ForgeServicesPreview({ data, shopSlug, preview = false }: ForgeServicesPreviewProps) {
  const { services, minisite, shop } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("forge");
  const meta = FORGE_SECTION_META.services;
  const suspended = shop.status === "suspended";

  if (content.show?.prices === false) {
    return null;
  }

  const catalog = services.slice(0, 6);

  return (
    <section
      id={anchors.services}
      className="ms-forge-services ms-forge-section ms-cinema-section"
      aria-label="Leistungen"
    >
      <div {...forgeReveal("up", 0)} className="ms-forge-services-header">
        <p className="ms-forge-eyebrow">
          {getForgeSectionField(content, "services", "eyebrow", meta.defaults.eyebrow ?? "")}
        </p>
        <h2 className="ms-forge-section-title mx-auto mt-[var(--space-4)] max-w-2xl text-center">
          {getForgeSectionField(content, "services", "title", meta.defaults.title ?? "")}
        </h2>
        <p className="ms-forge-section-text mx-auto mt-[var(--space-5)] max-w-xl text-center">
          {getForgeSectionField(content, "services", "text", meta.defaults.text ?? "")}
        </p>
      </div>

      {catalog.length > 0 ? (
        <ul className="ms-forge-services-grid" data-forge-stagger>
          {catalog.map((service, index) => (
            <li key={service.id} {...forgeReveal("up", index * 80)}>
              <ForgeServiceCard
                service={service}
                shopSlug={shopSlug}
                preview={preview}
                suspended={suspended}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div {...forgeReveal("fade", 200)} className="mt-[var(--space-8)] flex justify-center">
        <NicolesPillLink
          href={preview ? `#${anchors.prices}` : `/s/${shopSlug}/leistungen`}
          label={getForgeSectionField(content, "services", "cta_label", meta.defaults.cta_label ?? "ZU DEN LEISTUNGEN")}
          preview={preview}
        />
      </div>
    </section>
  );
}
