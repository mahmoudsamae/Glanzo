import { resolveKontaktMapDirections } from "@/lib/minisite/nicoles-kontakt-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesKontaktMapIllustration } from "./nicoles-kontakt-map-illustration";

type NicolesKontaktMapProps = {
  data: ShopPublicData;
};

export function NicolesKontaktMap({ data }: NicolesKontaktMapProps) {
  const directions = resolveKontaktMapDirections(data.minisite.content);

  return (
    <section
      className="ms-nicoles-kontakt-map ms-nicoles-section ms-cinema-section bg-white px-[var(--space-4)] py-[var(--space-14)]"
      aria-labelledby="nicoles-kontakt-map-heading"
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="ms-nicoles-eyebrow">Anfahrt</p>
        <h2
          id="nicoles-kontakt-map-heading"
          className="ms-nicoles-display mt-[var(--space-3)] font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[color:var(--ms-nicoles-ink)]"
        >
          So findest du uns!
        </h2>

        <div className="mx-auto mt-[var(--space-8)] size-[min(100%,25rem)] text-[color:var(--ms-accent)]">
          <NicolesKontaktMapIllustration shopName={data.shop.name} />
        </div>

        <p className="mx-auto mt-[var(--space-8)] max-w-lg text-base leading-relaxed text-[color:var(--ms-nicoles-ink-muted)]">
          {directions}
        </p>
      </div>
    </section>
  );
}
