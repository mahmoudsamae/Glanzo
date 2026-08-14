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
  const popularIndex = visible.length >= 3 ? 1 : -1;

  return (
    <section id={anchors.services} className="ms-velvet-services" aria-label="Services">
      <div className="ms-velvet-services-ambient" aria-hidden />
      <div className="ms-velvet-services-inner">
        <header {...velvetReveal("fade", 0, "ms-velvet-section-header ms-velvet-services-header")}>
          <p className="ms-velvet-eyebrow">
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="ms-velvet-section-title ms-velvet-display">{title}</h2>
        </header>

        <div className="ms-velvet-services-editorial">
          {visible.map((service, i) => {
            const imgSrc = resolveServiceImage(service, i);
            const bookHref = preview ? "#" : `${bookBase}&service=${encodeURIComponent(service.id)}`;
            const num = String(i + 1).padStart(2, "0");
            const isFeatured = i === 0 && visible.length > 1;
            const badge = isFeatured
              ? i18n.services.signatureBadge
              : i === popularIndex
                ? i18n.services.popularBadge
                : null;

            return (
              <article
                key={service.id}
                className={`ms-velvet-service-card ms-velvet-reveal ms-velvet-reveal--up${isFeatured ? " is-featured" : ""}`}
                style={{ "--velvet-delay": `${i * 110}ms` } as CSSProperties}
              >
                {/* Image */}
                <div className="ms-velvet-service-card-img">
                  <Image
                    src={imgSrc}
                    alt={service.name}
                    fill
                    sizes={isFeatured ? "(max-width: 767px) 100vw, 56vw" : "(max-width: 639px) 100vw, (max-width: 1023px) 46vw, 30vw"}
                    className="ms-velvet-photo"
                  />
                  <div className="ms-velvet-service-card-sheen" aria-hidden />
                  <div className="ms-velvet-service-card-scrim" aria-hidden />
                  {badge ? <span className="ms-velvet-service-card-badge">{badge}</span> : null}
                  <span className="ms-velvet-service-card-num">{num}</span>
                </div>

                {/* Body */}
                <div className="ms-velvet-service-card-body">
                  <div className="ms-velvet-service-card-head">
                    <h3 className="ms-velvet-service-card-name ms-velvet-display">{service.name}</h3>
                    <span className="ms-velvet-service-card-duration">{service.duration_min} min</span>
                  </div>

                  {service.description?.trim() ? (
                    <p className="ms-velvet-service-card-desc">{service.description.trim()}</p>
                  ) : null}

                  <div className="ms-velvet-service-card-footer">
                    {service.show_price !== false && (
                      <span className="ms-velvet-service-card-price">
                        <span className="ms-velvet-service-card-price-from">{i18n.services.from}</span>
                        <span className="ms-velvet-service-card-price-value">
                          {formatPriceCents(service.price_cents, content.currency)}
                        </span>
                      </span>
                    )}

                    {preview ? (
                      <span className="ms-velvet-service-card-cta" aria-hidden>
                        {i18n.nav.bookNow}
                        <svg className="ms-velvet-service-card-cta-arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                          <path d="M0.5 5H13M13 5L9 1M13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <Link href={bookHref} scroll={false} className="ms-velvet-service-card-cta">
                        {i18n.nav.bookNow}
                        <svg className="ms-velvet-service-card-cta-arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                          <path d="M0.5 5H13M13 5L9 1M13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
