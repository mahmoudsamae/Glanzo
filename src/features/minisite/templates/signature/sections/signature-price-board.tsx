import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { PRICE_LEADER_CLASS } from "@/lib/minisite/price-leader";

import { SignatureSectionShell } from "../signature-section-shell";

type SignaturePriceBoardProps = {
  services: ShopPublicData["services"];
  content: MinisiteContent;
};

export function SignaturePriceBoard({ services, content }: SignaturePriceBoardProps) {
  if (content.show?.prices === false || services.length === 0) {
    return null;
  }

  return (
    <section
      id="ms-sig-prices"
      aria-label="Preisliste"
      className="ms-signature-band ms-signature-band--cream ms-signature-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <SignatureSectionShell>
        <div className="ms-signature-card">
          <header className="flex flex-col items-center gap-[var(--space-3)] text-center">
            <p className="ms-signature-eyebrow">Leistungen</p>
            <h2 className="font-display text-2xl text-[color:var(--ms-text)]">Preise</h2>
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
      </SignatureSectionShell>
    </section>
  );
}
