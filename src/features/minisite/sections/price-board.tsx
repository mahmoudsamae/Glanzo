import type { ShopPublicData } from "@/lib/validations/public-shop";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { PRICE_LEADER_CLASS } from "@/lib/minisite/price-leader";

type PriceBoardProps = {
  services: ShopPublicData["services"];
};

export function PriceBoardSection({ services }: PriceBoardProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Preisliste"
      className="ms-cinema-section border-y border-[color:var(--ms-border-subtle)] bg-[color:var(--ms-bg-elevated)] px-[var(--space-4)] py-[var(--space-8)]"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-[var(--space-6)]">
        <header className="flex flex-col gap-[var(--space-3)] text-center">
          <h2 className="font-display text-xl text-[color:var(--ms-text)]">Preise</h2>
          <div className="ms-cinema-ornament" aria-hidden />
        </header>

        <ul className="ms-cinema-cascade flex flex-col gap-[var(--space-4)]">
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
    </section>
  );
}
