import { resolveNicolesServiceCards, serviceCardImage } from "@/lib/minisite/nicoles-prices-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesServicesGridProps = {
  content: MinisiteContent;
};

export function NicolesServicesGrid({ content }: NicolesServicesGridProps) {
  const cards = resolveNicolesServiceCards(content).slice(0, 6);

  return (
    <section
      className="ms-nicoles-services-grid-section ms-nicoles-section ms-cinema-section bg-white px-[var(--space-4)] py-[var(--space-14)]"
      aria-label="Leistungen Übersicht"
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <li key={card.id}>
            <article className="ms-nicoles-service-card text-center">
              <div className="relative aspect-square overflow-hidden bg-[color:var(--ms-border-subtle)]">
                <NicolesPhoto
                  path={serviceCardImage(content, index, card.image_path)}
                  sizes="(min-width:1024px) 320px, 50vw"
                />
              </div>
              <h2 className="ms-nicoles-service-card-title mt-[var(--space-4)] text-[color:var(--ms-nicoles-ink)]">
                {card.title}
              </h2>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
