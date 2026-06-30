import Image from "next/image";
import type { CSSProperties } from "react";

import { velvetReveal, type VelvetRevealVariant } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

const VELVET_GALLERY_ID = "ms-velvet-gallery";

type VelvetGallerySectionProps = {
  data: ShopPublicData;
  preview?: boolean;
  i18n: VelvetI18n;
};

function resolveGalleryImages(content: MinisiteContent): string[] {
  const paths = content.sections?.gallery?.image_paths;
  if (Array.isArray(paths) && paths.length > 0) {
    return paths.slice(0, 6).map((p) => shopMediaPublicUrl(p));
  }
  if (Array.isArray(content.gallery) && content.gallery.length > 0) {
    return (content.gallery as string[]).slice(0, 6).map((p) => shopMediaPublicUrl(p));
  }
  const coverPath = content.cover_path?.trim();
  return coverPath ? [shopMediaPublicUrl(coverPath)] : [];
}

// Captions now come from i18n — removed static const

/* Editorial floating-card composition — overlapping, asymmetric, alive */
type CardLayout = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width: string;
  rotate: string;
  z: number;
  breatheDur: string;
  breatheDelay: string;
  reveal: VelvetRevealVariant;
};

const CARD_LAYOUT: CardLayout[] = [
  { top: "4%", left: "0%", width: "46%", rotate: "-1.5deg", z: 3, breatheDur: "9s", breatheDelay: "0s", reveal: "left" },
  { top: "0%", right: "2%", width: "27%", rotate: "4deg", z: 5, breatheDur: "7s", breatheDelay: "0.6s", reveal: "right" },
  { top: "32%", right: "18%", width: "23%", rotate: "-3deg", z: 4, breatheDur: "8.5s", breatheDelay: "1.2s", reveal: "right" },
  { top: "58%", left: "6%", width: "25%", rotate: "-6deg", z: 6, breatheDur: "6.5s", breatheDelay: "0.3s", reveal: "up" },
  { bottom: "0%", right: "0%", width: "31%", rotate: "5deg", z: 2, breatheDur: "10s", breatheDelay: "1.6s", reveal: "right" },
  { bottom: "4%", left: "36%", width: "21%", rotate: "2deg", z: 7, breatheDur: "7.5s", breatheDelay: "2s", reveal: "up" },
];

const DECO_LAYOUT = [
  { top: "-3%", left: "38%", size: "4.5rem" },
  { bottom: "10%", right: "32%", size: "3.25rem" },
] as const;

function tileNumber(i: number): string {
  return String(i + 1).padStart(2, "0");
}

export function VelvetGallerySection({ data, preview = false, i18n }: VelvetGallerySectionProps) {
  const content = data.minisite.content;
  if (content.show?.gallery === false) return null;

  const meta = VELVET_SECTION_META.gallery;
  const eyebrow =
    content.sections?.gallery?.eyebrow?.trim() || meta.defaults.eyebrow || i18n.gallery.eyebrow;
  const title =
    content.sections?.gallery?.title?.trim() || meta.defaults.title || i18n.gallery.title;
  const captions = i18n.gallery.captions;

  const images = resolveGalleryImages(content);
  const tiles = images.length > 0 ? images : (Array(6).fill(null) as null[]);

  return (
    <section id={VELVET_GALLERY_ID} className="ms-velvet-gallery" aria-label="Gallery">
      <div className="ms-velvet-gallery-inner">
        <header {...velvetReveal("fade", 0, "ms-velvet-section-header")}>
          <p className="ms-velvet-eyebrow">
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
            {eyebrow}
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
          </p>
          <h2 className="ms-velvet-section-title ms-velvet-display">{title}</h2>
        </header>

        <div className="ms-velvet-gallery-composition" data-velvet-stagger>
          {/* Decorative floating glass orbs */}
          {DECO_LAYOUT.map((deco, i) => (
            <div
              key={`deco-${i}`}
              className="ms-velvet-gallery-deco"
              style={{ ...deco, width: deco.size, height: deco.size } as CSSProperties}
              aria-hidden
            />
          ))}

          {tiles.map((src, i) => {
            const layout = CARD_LAYOUT[i % CARD_LAYOUT.length]!;
            const reveal = velvetReveal(layout.reveal, i * 120);

            const cardStyle = {
              ...reveal.style,
              "--card-top": layout.top,
              "--card-left": layout.left,
              "--card-right": layout.right,
              "--card-bottom": layout.bottom,
              "--card-width": layout.width,
              "--rotate": layout.rotate,
              "--card-z": layout.z,
              "--breathe-dur": layout.breatheDur,
              "--breathe-delay": layout.breatheDelay,
              aspectRatio: "4 / 5",
            } as CSSProperties;

            return (
              <div
                key={i}
                style={cardStyle}
                className={`ms-velvet-gallery-tile ${reveal.className} ${i === 0 ? "ms-velvet-gallery-tile--featured" : ""}`}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={captions[i] ?? `Nail art ${i + 1}`}
                    fill
                    sizes="(max-width: 767px) 90vw, 40vw"
                    className="ms-velvet-photo"
                  />
                ) : (
                  <div className="ms-velvet-gallery-placeholder" aria-hidden />
                )}

                <div className="ms-velvet-gallery-tile-overlay" aria-hidden />
                <div className="ms-velvet-gallery-tile-glow" aria-hidden />

                <div className="ms-velvet-gallery-tile-caption">
                  <p className="ms-velvet-gallery-tile-label ms-velvet-display">
                    {captions[i] ?? `Set ${i + 1}`}
                  </p>
                  <span className="ms-velvet-gallery-number" aria-hidden>
                    {tileNumber(i)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
