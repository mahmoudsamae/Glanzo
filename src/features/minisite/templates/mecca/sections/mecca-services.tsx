import Link from "next/link";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

const PREVIEW_SERVICE_LIMIT = 8;
const DEFAULT_CATEGORY = "Leistungen";

type MeccaServicesSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

type MeccaService = ShopPublicData["services"][number] & {
  category?: string | null;
  description?: string | null;
};

type BlockField = "eyebrow" | "title" | "text" | "cta_label";

function getSectionField(
  content: MinisiteContent,
  field: BlockField,
  fallback: string,
): string {
  const block = content.sections?.services;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function serviceCategory(service: MeccaService): string {
  return service.category?.trim() || DEFAULT_CATEGORY;
}

function serviceDescription(service: MeccaService): string {
  if (service.description?.trim()) {
    return service.description.trim();
  }
  return `${service.duration_min} Min.`;
}

function groupServicesByCategory(services: MeccaService[]): Array<[string, MeccaService[]]> {
  const groups = new Map<string, MeccaService[]>();

  for (const service of services) {
    const category = serviceCategory(service);
    const existing = groups.get(category) ?? [];
    existing.push(service);
    groups.set(category, existing);
  }

  return Array.from(groups.entries());
}

export function MeccaServicesSection({ data, shopSlug, preview = false }: MeccaServicesSectionProps) {
  const { minisite, services } = data;
  const content = minisite.content;

  if (content.show?.prices === false || services.length === 0) {
    return null;
  }

  const anchors = getMinisiteAnchors("nicoles");
  const meta = MECCA_SECTION_META.services;
  const eyebrow = getSectionField(content, "eyebrow", meta.defaults.eyebrow ?? "LEISTUNGEN");
  const title = getSectionField(content, "title", meta.defaults.title ?? "Maßgeschneidert für dich.");
  const ctaLabel = getSectionField(content, "cta_label", "Alle Leistungen →");

  const visibleServices = services.slice(0, PREVIEW_SERVICE_LIMIT) as MeccaService[];
  const hasMore = services.length > PREVIEW_SERVICE_LIMIT;
  const groupedServices = groupServicesByCategory(visibleServices);
  const leistungenHref = preview ? `#${anchors.prices}` : `/s/${shopSlug}/leistungen`;

  return (
    <section
      id={anchors.services}
      className="ms-mecca-services ms-mecca-section"
      aria-label="Leistungen"
    >
      <div className="ms-mecca-services-inner">
        <header className="ms-mecca-services-header">
          <p className="ms-mecca-services-eyebrow">{eyebrow}</p>
          <h2 className="ms-mecca-services-title">{title}</h2>
        </header>

        {groupedServices.map(([category, items]) => (
          <div key={category} className="ms-mecca-services-group">
            <h3 className="ms-mecca-service-category">{category}</h3>
            <ul>
              {items.map((service) => (
                <li key={service.id} className="ms-mecca-service-row">
                  <p className="ms-mecca-service-name">{service.name}</p>
                  <p className="ms-mecca-service-desc">{serviceDescription(service)}</p>
                  <div className="ms-mecca-price-from">
                    <small>ab</small>
                    <strong>{formatPriceCents(service.price_cents)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {hasMore ? (
          <div className="text-center">
            {preview ? (
              <span className="ms-mecca-services-cta">{ctaLabel}</span>
            ) : (
              <Link href={leistungenHref} className="ms-mecca-services-cta">
                {ctaLabel}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
