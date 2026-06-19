import { getNicolesSectionField, NICOLES_SECTION_META, resolveNicolesNews } from "@/lib/minisite/nicoles-sections";
import { resolveNicolesNewsImage } from "@/lib/minisite/nicoles-stock-images";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesNewsSectionProps = {
  data: ShopPublicData;
};

export function NicolesNewsSection({ data }: NicolesNewsSectionProps) {
  const content = data.minisite.content;
  const meta = NICOLES_SECTION_META.news;
  const items = resolveNicolesNews(content).slice(0, 3);

  return (
    <section
      className="ms-nicoles-news ms-nicoles-section ms-cinema-section bg-white px-[var(--space-5)] py-[var(--space-14)] sm:px-[var(--space-6)]"
      aria-label="Aktuelles"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="ms-nicoles-eyebrow">
            {getNicolesSectionField(content, "news", "eyebrow", meta.defaults.eyebrow ?? "")}
          </p>
          <h2 className="ms-nicoles-display mx-auto mt-[var(--space-4)] max-w-2xl font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.12] text-[color:var(--ms-nicoles-ink)]">
            {getNicolesSectionField(content, "news", "title", meta.defaults.title ?? "")}
          </h2>
        </div>

        <ul className="mt-[var(--space-10)] grid gap-[var(--space-8)] sm:grid-cols-2 sm:gap-[var(--space-6)] lg:grid-cols-3">
          {items.map((item, index) => {
            const imagePath = resolveNicolesNewsImage(content, index, item.image_path);
            return (
              <li key={item.id}>
                <article>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--ms-border-subtle)]">
                    <NicolesPhoto path={imagePath} color sizes="320px" />
                  </div>
                  <h3 className="mt-[var(--space-3)] font-display text-lg leading-snug text-[color:var(--ms-nicoles-ink)]">
                    {item.title}
                  </h3>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
