import Image from "next/image";

import { forgeReveal } from "@/lib/minisite/forge-motion";
import { resolveNicolesNews } from "@/lib/minisite/nicoles-sections";
import { getForgeSectionField, FORGE_SECTION_META } from "@/lib/minisite/forge-sections";
import { resolveNicolesNewsImage } from "@/lib/minisite/nicoles-stock-images";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";
import { ForgeShineFrame } from "../forge-shine-frame";

type ForgeNewsSectionProps = {
  data: ShopPublicData;
};

export function ForgeNewsSection({ data }: ForgeNewsSectionProps) {
  const content = data.minisite.content;
  const meta = FORGE_SECTION_META.news;
  const items = resolveNicolesNews(content).slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="ms-forge-news"
      className="ms-forge-news ms-forge-section ms-cinema-section"
      aria-label="Aktuelles"
    >
      <div className="ms-forge-news-inner">
        <div {...forgeReveal("up", 0)} className="text-center">
          <p className="ms-forge-eyebrow">
            {getForgeSectionField(content, "news", "eyebrow", meta.defaults.eyebrow ?? "")}
          </p>
          <h2 className="ms-forge-section-title mx-auto mt-[var(--space-4)] max-w-2xl">
            {getForgeSectionField(content, "news", "title", meta.defaults.title ?? "")}
          </h2>
        </div>

        <ul className="ms-forge-news-grid" data-forge-stagger>
          {items.map((item, index) => {
            const imagePath = resolveNicolesNewsImage(content, index, item.image_path);
            return (
              <li key={item.id} {...forgeReveal("up", index * 90)}>
                <ForgeShineFrame variant="card" className="ms-forge-news-card">
                  <div className="ms-forge-news-card-media">
                    <Image
                      src={shopMediaPublicUrl(imagePath)}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 320px, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="ms-forge-news-card-title">{item.title}</h3>
                </ForgeShineFrame>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
