import Image from "next/image";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { velvetReveal } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import { TEMPLATE_STOCK } from "@/lib/minisite/template-stock-images";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

const PREVIEW_LIMIT = 9;
const DEFAULT_CATEGORY = "Our Services";

type VelvetServicesSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

type Service = ShopPublicData["services"][number];

function getField(content: MinisiteContent, field: "eyebrow" | "title" | "text" | "cta_label", fallback: string): string {
  const block = content.sections?.services;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function serviceDesc(service: Service): string {
  if (service.description?.trim()) return service.description.trim();
  return `${service.duration_min} min`;
}

function resolveFeatureImage(services: Service[], content: MinisiteContent): string {
  const withImage = services.find((s) => s.image_path?.trim());
  if (withImage?.image_path) return shopMediaPublicUrl(withImage.image_path);
  const blockPath = content.sections?.services?.image_path?.trim();
  if (blockPath) return shopMediaPublicUrl(blockPath);
  if (content.cover_path?.trim()) return shopMediaPublicUrl(content.cover_path);
  return TEMPLATE_STOCK.services[0];
}

function groupByCategory(services: Service[]): Array<[string, Service[]]> {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const cat = DEFAULT_CATEGORY;
    const existing = groups.get(cat) ?? [];
    existing.push(service);
    groups.set(cat, existing);
  }
  return Array.from(groups.entries());
}

export function VelvetServicesSection({ data, shopSlug, preview = false }: VelvetServicesSectionProps) {
  const { minisite, services } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("velvet");

  if (content.show?.prices === false || services.length === 0) return null;

  const meta = VELVET_SECTION_META.services;
  const eyebrow = getField(content, "eyebrow", meta.defaults.eyebrow ?? "THE MENU");
  const title = getField(content, "title", meta.defaults.title ?? "Curated Services.");
  const featureText = getField(content, "text", "Precision, artistry, and care — in every appointment.");
  const ctaLabel = getField(content, "cta_label", meta.defaults.cta_label ?? "View Full Menu →");

  const visible = services.slice(0, PREVIEW_LIMIT) as Service[];
  const hasMore = services.length > PREVIEW_LIMIT;
  const groups = groupByCategory(visible);
  const featureImage = resolveFeatureImage(visible, content);

  return (
    <section id={anchors.services} className="ms-velvet-services" aria-label="Services">
      <div className="ms-velvet-services-inner">
        <header className="ms-velvet-section-header" style={{ textAlign: "left", marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
          <p className="ms-velvet-eyebrow">
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="ms-velvet-section-title ms-velvet-display">{title}</h2>
        </header>

        <div className="ms-velvet-services-layout">
          {/* Feature image */}
          <div {...velvetReveal("left", 0, "ms-velvet-services-feature")}>
            <Image
              src={featureImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="ms-velvet-photo"
            />
            <div className="ms-velvet-services-feature-overlay">
              <p className="ms-velvet-services-feature-title ms-velvet-display">The Collection</p>
              <p className="ms-velvet-services-feature-text">{featureText}</p>
            </div>
          </div>

          {/* Service list */}
          <div {...velvetReveal("right", 120)}>
            <div className="ms-velvet-services-list-header">
              <p className="ms-velvet-eyebrow" style={{ marginBottom: "0.75rem" }}>
                <span className="ms-velvet-eyebrow-ornament" aria-hidden />
                {groups.length > 0 ? groups[0]?.[0] : DEFAULT_CATEGORY}
              </p>
            </div>

            <div data-velvet-stagger>
              {groups.map(([category, items]) => (
                <div key={category} className="ms-velvet-service-group">
                  {groups.length > 1 ? (
                    <h3 className="ms-velvet-service-group-name ms-velvet-display">{category}</h3>
                  ) : null}
                  <ul>
                    {items.map((service) => (
                      <li
                        key={service.id}
                        className="ms-velvet-service-row ms-velvet-reveal ms-velvet-reveal--up"
                      >
                        <div>
                          <p className="ms-velvet-service-name">{service.name}</p>
                          <p className="ms-velvet-service-desc">{serviceDesc(service)}</p>
                        </div>
                        {service.show_price !== false ? (
                          <p className="ms-velvet-service-price ms-velvet-display">
                            <small>from</small>
                            {formatPriceCents(service.price_cents)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {hasMore ? (
              <div className="mt-6">
                <span className="ms-velvet-services-cta">{ctaLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
