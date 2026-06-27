import Image from "next/image";
import Link from "next/link";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { meccaReveal } from "@/lib/minisite/mecca-motion";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import { TEMPLATE_STOCK } from "@/lib/minisite/template-stock-images";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

const PREVIEW_SERVICE_LIMIT = 8;
const DEFAULT_CATEGORY = "Leistungen";

type MeccaServicesSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

type MeccaService = ShopPublicData["services"][number];

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

function serviceCategory(_service: MeccaService): string {
  return DEFAULT_CATEGORY;
}

function serviceDescription(service: MeccaService): string {
  if (service.description?.trim()) {
    return service.description.trim();
  }
  return `${service.duration_min} Min.`;
}

function serviceShowsPrice(service: MeccaService): boolean {
  return service.show_price !== false;
}

function resolveFeatureImage(services: MeccaService[], content: MinisiteContent): string {
  const withImage = services.find((service) => service.image_path?.trim());
  if (withImage?.image_path) {
    return shopMediaPublicUrl(withImage.image_path);
  }
  return resolveServicesImage(content);
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

function resolveServicesImage(content: MinisiteContent): string {
  const blockPath =
    content.sections?.services?.image_path?.trim() ||
    content.sections?.services?.image_paths?.[0]?.trim();
  if (blockPath) {
    return shopMediaPublicUrl(blockPath);
  }
  if (content.cover_path?.trim()) {
    return shopMediaPublicUrl(content.cover_path);
  }
  return TEMPLATE_STOCK.services[0];
}

export function MeccaServicesSection({ data, shopSlug, preview = false }: MeccaServicesSectionProps) {
  const { minisite, services } = data;
  const content = minisite.content;

  if (content.show?.prices === false || services.length === 0) {
    return null;
  }

  const anchors = getMinisiteAnchors("mecca");
  const meta = MECCA_SECTION_META.services;
  const eyebrow = getSectionField(content, "eyebrow", meta.defaults.eyebrow ?? "LEISTUNGEN");
  const title = getSectionField(content, "title", meta.defaults.title ?? "Maßgeschneidert für dich.");
  const featureText = getSectionField(
    content,
    "text",
    "Ein kuratiertes Menü aus Schnitt, Styling und Pflege — präzise abgestimmt auf deinen Look.",
  );
  const ctaLabel = getSectionField(content, "cta_label", "Alle Leistungen →");

  const visibleServices = services.slice(0, PREVIEW_SERVICE_LIMIT) as MeccaService[];
  const hasMore = services.length > PREVIEW_SERVICE_LIMIT;
  const groupedServices = groupServicesByCategory(visibleServices);
  const leistungenHref = preview ? `#${anchors.prices}` : `/s/${shopSlug}/leistungen`;
  const featureImage = resolveFeatureImage(visibleServices, content);
  const servicesWithImages = visibleServices.filter((service) => service.image_path?.trim());

  return (
    <section
      id={anchors.services}
      className="ms-mecca-services ms-mecca-section"
      aria-label="Leistungen"
    >
      <div className="ms-mecca-services-inner">
        <div className="ms-mecca-services-split">
          <div {...meccaReveal("left", 0, "ms-mecca-services-feature")}>
            <Image
              src={featureImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="ms-mecca-photo object-cover"
            />
            <div className="ms-mecca-services-feature-overlay">
              <p className="ms-mecca-services-feature-title">The Collection</p>
              <p className="ms-mecca-services-feature-text">{featureText}</p>
            </div>
          </div>

          <div {...meccaReveal("right", 120)}>
            <header className="mb-8">
              <p className="ms-mecca-services-eyebrow">{eyebrow}</p>
              <h2 className="ms-mecca-services-title text-left">{title}</h2>
            </header>

            {servicesWithImages.length > 0 ? (
              <div className="ms-mecca-services-visuals" data-mecca-stagger>
                {servicesWithImages.slice(0, 3).map((service) => (
                  <div
                    key={service.id}
                    className="ms-mecca-services-visual ms-mecca-reveal ms-mecca-reveal--up"
                  >
                    <Image
                      src={shopMediaPublicUrl(service.image_path!)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 18vw, 33vw"
                      className="ms-mecca-photo object-cover"
                    />
                    <div className="ms-mecca-services-visual-overlay">
                      <p className="ms-mecca-services-visual-title">{service.name}</p>
                      <p className="ms-mecca-services-visual-text">{serviceDescription(service)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div data-mecca-stagger>
              {groupedServices.map(([category, items]) => (
                <div key={category} className="ms-mecca-services-group">
                  <h3 className="ms-mecca-service-category">{category}</h3>
                  <ul>
                    {items.map((service) => (
                      <li key={service.id} className="ms-mecca-service-row ms-mecca-reveal ms-mecca-reveal--up">
                        {service.image_path ? (
                          <div className="ms-mecca-service-thumb">
                            <Image
                              src={shopMediaPublicUrl(service.image_path)}
                              alt=""
                              fill
                              sizes="72px"
                              className="ms-mecca-photo object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="ms-mecca-service-copy">
                          <p className="ms-mecca-service-name">{service.name}</p>
                          <p className="ms-mecca-service-desc">{serviceDescription(service)}</p>
                        </div>
                        {serviceShowsPrice(service) ? (
                          <div className="ms-mecca-price-from">
                            <small>ab</small>
                            <strong>{formatPriceCents(service.price_cents)}</strong>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {hasMore ? (
              <div className="mt-8">
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
        </div>
      </div>
    </section>
  );
}
