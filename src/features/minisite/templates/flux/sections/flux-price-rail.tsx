import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { formatPriceCents } from "@/lib/minisite/format-price";

type FluxPriceRailProps = {
  services: ShopPublicData["services"];
  content: MinisiteContent;
};

export function FluxPriceRail({ services, content }: FluxPriceRailProps) {
  if (content.show?.prices === false || services.length === 0) {
    return null;
  }

  return (
    <section aria-label="Preisliste" className="ms-flux-section py-[var(--space-8)]">
      <div className="mb-[var(--space-4)] flex items-end justify-between gap-[var(--space-3)] px-[var(--space-4)]">
        <div>
          <p className="ms-flux-kicker">Leistungen</p>
          <h2 className="font-display text-2xl uppercase tracking-tight text-[color:var(--ms-text)]">
            Preise
          </h2>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--ms-text-muted)]">
          {services.length} Services
        </span>
      </div>

      <div className="ms-flux-rail-scroll flex gap-[var(--space-3)] overflow-x-auto overscroll-x-contain px-[var(--space-4)] pb-[var(--space-2)]">
        {services.map((service, index) => (
          <article
            key={service.id}
            className="ms-flux-price-chip snap-start shrink-0"
            style={{ ["--chip-i" as string]: index }}
          >
            <span className="ms-flux-price-chip-index" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-md uppercase leading-tight text-[color:var(--ms-text)]">
              {service.name}
            </h3>
            <p className="mt-[var(--space-3)] text-2xl tabular-nums text-[color:var(--ms-accent)]">
              {formatPriceCents(service.price_cents)}
            </p>
            <p className="mt-[var(--space-1)] text-xs uppercase tracking-wider text-[color:var(--ms-text-muted)]">
              {service.duration_min} min
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
