import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { PRICE_LEADER_CLASS } from "@/lib/minisite/price-leader";

import { BoutiqueSectionShell } from "../boutique-section-shell";

type BoutiquePriceBoardProps = {
  services: ShopPublicData["services"];
  content: MinisiteContent;
  sectionId?: string;
};

export function BoutiquePriceBoard({
  services,
  content,
  sectionId = "ms-boutique-prices",
}: BoutiquePriceBoardProps) {
  if (content.show?.prices === false || services.length === 0) {
    return null;
  }

  const eyebrow = getBoutiqueSectionField(
    content,
    "prices",
    "eyebrow",
    BOUTIQUE_SECTION_META.prices.defaults.eyebrow ?? "Leistungen",
  );
  const title = getBoutiqueSectionField(
    content,
    "prices",
    "title",
    BOUTIQUE_SECTION_META.prices.defaults.title ?? "Preise",
  );

  return (
    <section
      id={sectionId}
      aria-label="Preisliste"
      className="ms-boutique-band ms-boutique-band--cream ms-boutique-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <BoutiqueSectionShell>
        <div className="ms-boutique-card">
          <header className="flex flex-col items-center gap-[var(--space-3)] text-center">
            <p className="ms-boutique-eyebrow">{eyebrow}</p>
            <h2 className="font-display text-2xl text-[color:var(--ms-text)]">{title}</h2>
            <div className="ms-cinema-ornament" aria-hidden />
          </header>

          <ul className="ms-cinema-cascade mt-[var(--space-6)] flex flex-col gap-[var(--space-5)]">
            {services.map((service, index) => (
              <li
                key={service.id}
                className="ms-cinema-price-row flex items-baseline gap-0"
                style={{ ["--cascade-i" as string]: index }}
              >
                <span className="shrink-0 font-display text-md text-[color:var(--ms-text)]">
                  {service.name}
                </span>
                <span
                  className={`ms-cinema-leader ${PRICE_LEADER_CLASS}`}
                  style={{ ["--cascade-i" as string]: index }}
                  aria-hidden
                />
                <span className="ms-cinema-price shrink-0 text-data text-md tabular-nums text-[color:var(--ms-accent-on-bg)]">
                  {formatPriceCents(service.price_cents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </BoutiqueSectionShell>
    </section>
  );
}
