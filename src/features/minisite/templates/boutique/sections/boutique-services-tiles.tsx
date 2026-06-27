import Image from "next/image";

import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { shopMediaPublicUrl } from "../../../lib/media-url";

import { BoutiqueSectionShell } from "../boutique-section-shell";

type BoutiqueServicesTilesProps = {
  data: ShopPublicData;
};

function tileImage(content: MinisiteContent, index: number): string | null {
  const gallery = content.gallery?.filter(Boolean) ?? [];
  const path = gallery[index] ?? content.cover_path;
  return path ? shopMediaPublicUrl(path) : null;
}

export function BoutiqueServicesTiles({ data }: BoutiqueServicesTilesProps) {
  const { services, minisite } = data;
  const content = minisite.content;

  if (content.show?.prices === false || services.length === 0) {
    return null;
  }

  const tiles = services.slice(0, 3);
  const eyebrow = getBoutiqueSectionField(
    content,
    "services",
    "eyebrow",
    BOUTIQUE_SECTION_META.services.defaults.eyebrow ?? "Unsere Leistungen",
  );
  const title = getBoutiqueSectionField(
    content,
    "services",
    "title",
    BOUTIQUE_SECTION_META.services.defaults.title ?? "",
  );
  const intro = getBoutiqueSectionField(content, "services", "text", "");

  return (
    <section
      id="ms-boutique-services"
      aria-label="Leistungen"
      className="ms-boutique-band ms-boutique-band--cream ms-boutique-section ms-cinema-section px-[var(--space-4)] py-[var(--space-12)]"
    >
      <BoutiqueSectionShell className="text-center">
        <p className="ms-boutique-eyebrow ms-boutique-eyebrow--dark">{eyebrow}</p>
        <h2 className="mt-[var(--space-3)] font-display text-2xl leading-snug text-[color:var(--ms-boutique-ink)] sm:text-3xl">
          {title}
        </h2>
        {intro ? (
          <p className="mx-auto mt-[var(--space-4)] max-w-2xl text-md leading-relaxed text-[color:var(--ms-boutique-ink-muted)]">
            {intro}
          </p>
        ) : null}
      </BoutiqueSectionShell>

      <ul className="mx-auto mt-[var(--space-8)] grid max-w-4xl grid-cols-1 gap-[var(--space-3)] min-[520px]:grid-cols-3">
        {tiles.map((service, index) => {
          const serviceImage = service.image_path?.trim()
            ? shopMediaPublicUrl(service.image_path)
            : tileImage(content, index);
          const showPrice = service.show_price !== false;
          const description = service.description?.trim();
          return (
            <li key={service.id} className="ms-boutique-service-tile">
              <div className="ms-boutique-service-tile-media relative aspect-square overflow-hidden">
                {serviceImage ? (
                  <Image
                    src={serviceImage}
                    alt=""
                    fill
                    sizes="(max-width: 520px) 100vw, 240px"
                    className="ms-boutique-service-tile-img object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[color:var(--ms-boutique-teal)]" aria-hidden />
                )}
              </div>
              <div className="px-[var(--space-2)] py-[var(--space-3)] text-center">
                <p className="font-display text-sm uppercase tracking-[0.14em] text-[color:var(--ms-boutique-ink)]">
                  {service.name}
                </p>
                {showPrice ? (
                  <p className="mt-[var(--space-1)] text-sm tabular-nums text-[color:var(--ms-accent-on-bg)]">
                    {formatPriceCents(service.price_cents)}
                  </p>
                ) : description ? (
                  <p className="mt-[var(--space-1)] text-sm text-[color:var(--ms-boutique-ink-muted)]">
                    {description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-[var(--space-8)] flex justify-center">
        <a href="#ms-boutique-prices" className="ms-boutique-pill-cta ms-boutique-pill-cta--dark">
          Zu den Leistungen
        </a>
      </div>
    </section>
  );
}
