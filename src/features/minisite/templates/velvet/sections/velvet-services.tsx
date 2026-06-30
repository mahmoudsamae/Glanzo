import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { velvetReveal } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import { TEMPLATE_STOCK } from "@/lib/minisite/template-stock-images";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

const PREVIEW_LIMIT = 9;

type VelvetServicesSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
  i18n: VelvetI18n;
};

type Service = ShopPublicData["services"][number];

function getField(content: MinisiteContent, field: "eyebrow" | "title" | "text" | "cta_label", fallback: string): string {
  const block = content.sections?.services;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function resolveServiceImage(service: Service, index: number): string {
  if (service.image_path?.trim()) return shopMediaPublicUrl(service.image_path.trim());
  const stock = TEMPLATE_STOCK.services;
  return stock[index % stock.length] ?? stock[0];
}

export function VelvetServicesSection({ data, shopSlug, preview = false, i18n }: VelvetServicesSectionProps) {
  const { minisite, services } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("velvet");

  if (content.show?.prices === false || services.length === 0) return null;

  const meta = VELVET_SECTION_META.services;
  const eyebrow = getField(content, "eyebrow", meta.defaults.eyebrow ?? i18n.services.eyebrow);
  const title = getField(content, "title", meta.defaults.title ?? i18n.services.title);

  const visible = services.slice(0, PREVIEW_LIMIT) as Service[];
  const bookBase = `/s/${shopSlug}?book=1`;

  return (
    <section id={anchors.services} className="ms-velvet-services" aria-label="Services">
      <div className="ms-velvet-services-inner">
        <header {...velvetReveal("fade", 0, "ms-velvet-section-header ms-velvet-services-header")}>
          <p className="ms-velvet-eyebrow">
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="ms-velvet-section-title ms-velvet-display">{title}</h2>
        </header>

        <div className="ms-velvet-services-list">
          {visible.map((service, i) => {
            const imgSrc = resolveServiceImage(service, i);
            const bookHref = preview ? "#" : `${bookBase}&service=${encodeURIComponent(service.id)}`;
            const num = String(i + 1).padStart(2, "0");

            return (
              <article
                key={service.id}
                className="ms-velvet-service-row ms-velvet-reveal ms-velvet-reveal--up"
                style={{ "--velvet-delay": `${i * 70}ms` } as CSSProperties}
              >
                {/* Thumbnail */}
                <div className="ms-velvet-service-row-img" aria-hidden>
                  <Image
                    src={imgSrc}
                    alt={service.name}
                    fill
                    sizes="(max-width: 639px) 72px, 96px"
                    className="ms-velvet-photo"
                  />
                  <div className="ms-velvet-service-row-img-shine" />
                </div>

                {/* Main info */}
                <div className="ms-velvet-service-row-body">
                  <div className="ms-velvet-service-row-header">
                    <span className="ms-velvet-service-row-num">{num}</span>
                    <h3 className="ms-velvet-service-row-name ms-velvet-display">{service.name}</h3>
                  </div>
                  {service.description?.trim() ? (
                    <p className="ms-velvet-service-row-desc">{service.description.trim()}</p>
                  ) : null}
                  <span className="ms-velvet-service-row-chip">{service.duration_min} min</span>
                </div>

                {/* Price + CTA */}
                <div className="ms-velvet-service-row-end">
                  {service.show_price !== false && (
                    <span className="ms-velvet-service-row-price">
                      <span className="ms-velvet-service-row-price-from">{i18n.services.from}</span>
                      {formatPriceCents(service.price_cents, content.currency)}
                    </span>
                  )}
                  {preview ? (
                    <span className="ms-velvet-service-row-cta" aria-hidden>
                      {i18n.nav.bookNow}
                    </span>
                  ) : (
                    <Link href={bookHref} scroll={false} className="ms-velvet-service-row-cta">
                      {i18n.nav.bookNow}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
