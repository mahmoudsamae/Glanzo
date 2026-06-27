import Image from "next/image";

import { meccaReveal } from "@/lib/minisite/mecca-motion";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import { TEMPLATE_STOCK } from "@/lib/minisite/template-stock-images";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";
import { MeccaBeforeAfter } from "../mecca-before-after.client";

type MeccaGallerySectionProps = {
  data: ShopPublicData;
  preview?: boolean;
};

function getGalleryField(
  content: MinisiteContent,
  field: "eyebrow" | "title",
  fallback: string,
): string {
  const block = content.sections?.gallery;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function resolveGalleryPaths(content: MinisiteContent): string[] {
  const uploaded = content.gallery?.map((path) => shopMediaPublicUrl(path)) ?? [];
  if (uploaded.length >= 3) {
    return uploaded.slice(0, 6);
  }
  return [...TEMPLATE_STOCK.gallery.slice(0, 6)];
}

export function MeccaGallerySection({ data }: MeccaGallerySectionProps) {
  const content = data.minisite.content;

  if (content.show?.gallery === false) {
    return null;
  }

  const meta = MECCA_SECTION_META.gallery;
  const eyebrow = getGalleryField(content, "eyebrow", meta.defaults.eyebrow ?? "VERWANDLUNGEN");
  const title = getGalleryField(content, "title", meta.defaults.title ?? "Vorher & Nachher.");
  const paths = resolveGalleryPaths(content);
  const [beforePath, afterPath, ...gridPaths] = paths;

  return (
    <section id="ms-mecca-gallery" className="ms-mecca-gallery-section ms-mecca-section" aria-label="Galerie">
      <div className="ms-mecca-gallery-inner">
        <header {...meccaReveal("up", 0, "ms-mecca-reviews-header")}>
          <p className="ms-mecca-reviews-eyebrow">{eyebrow}</p>
          <h2 className="ms-mecca-reviews-title">{title}</h2>
        </header>

        <MeccaBeforeAfter
          beforeSrc={beforePath ?? TEMPLATE_STOCK.gallery[0]}
          afterSrc={afterPath ?? TEMPLATE_STOCK.gallery[1]}
          beforeLabel="Vorher"
          afterLabel="Nachher"
        />

        <p {...meccaReveal("fade", 80, "ms-mecca-gallery-caption")}>
          Ziehe den Regler — sieh die Verwandlung.
        </p>

        <div className="ms-mecca-gallery-grid" data-mecca-stagger>
          {gridPaths.map((path, index) => (
            <div
              key={`${path}-${index}`}
              className={`ms-mecca-gallery-tile ms-mecca-reveal ms-mecca-reveal--up ${
                index === 0 ? "ms-mecca-gallery-tile--wide" : ""
              }`}
            >
              <Image src={path} alt="" fill sizes="(min-width:768px) 33vw, 50vw" className="ms-mecca-photo object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
