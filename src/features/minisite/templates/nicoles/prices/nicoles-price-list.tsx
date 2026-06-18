import { resolveNicolesPriceSections } from "@/lib/minisite/nicoles-prices-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

type NicolesPriceListProps = {
  content: MinisiteContent;
};

export function NicolesPriceList({ content }: NicolesPriceListProps) {
  const sections = resolveNicolesPriceSections(content).filter((section) => section.title.trim());

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      id="ms-nicoles-prices"
      className="ms-nicoles-price-list-section ms-nicoles-section ms-cinema-section bg-white px-[var(--space-4)] py-[var(--space-14)]"
      aria-label="Preisliste"
    >
      <div className="mx-auto max-w-[43.75rem]">
        {sections.map((section) => (
          <div key={section.id} className="ms-nicoles-price-group mb-[var(--space-10)] last:mb-0">
            <h2 className="ms-nicoles-price-group-title">{section.title}</h2>
            <ul className="mt-[var(--space-5)] space-y-[var(--space-3)]">
              {(section.rows ?? []).map((row) => (
                <li key={row.id ?? `${section.id}-${row.label}`} className="ms-nicoles-price-row flex items-baseline gap-0">
                  <span className="ms-nicoles-price-row-label shrink-0">{row.label}</span>
                  <span className="ms-nicoles-price-row-leader" aria-hidden />
                  <span className="ms-nicoles-price-row-price shrink-0 tabular-nums">{row.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
