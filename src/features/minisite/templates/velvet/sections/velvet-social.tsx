import Image from "next/image";

import { velvetReveal } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

type VelvetSocialSectionProps = {
  data: ShopPublicData;
  preview?: boolean;
};

function resolveStripImages(content: MinisiteContent): string[] {
  const galleryPaths = content.sections?.gallery?.image_paths;
  if (Array.isArray(galleryPaths) && galleryPaths.length > 0) {
    return galleryPaths.slice(0, 8).map((p) => shopMediaPublicUrl(p));
  }
  const coverPath = content.cover_path?.trim();
  return coverPath ? [shopMediaPublicUrl(coverPath)] : [];
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function VelvetSocialSection({ data, preview = false }: VelvetSocialSectionProps) {
  const content = data.minisite.content;
  if (content.show?.social === false) return null;

  const meta = VELVET_SECTION_META.social;
  const ctaLabel = meta.defaults.cta_label || "Follow on Instagram →";

  const instagram = content.links?.instagram || content.instagram;
  const instagramHandle = instagram
    ? instagram.startsWith("@")
      ? instagram
      : `@${instagram}`
    : "@nailatelier";

  const instagramUrl =
    instagram && !preview
      ? `https://instagram.com/${instagram.replace("@", "")}`
      : null;

  const images = resolveStripImages(content);

  return (
    <section className="ms-velvet-social" aria-label="Follow on Instagram">
      <div className="ms-velvet-social-inner">
        <div {...velvetReveal("fade", 0)}>
          {/* Subtitle above handle */}
          <p className="ms-velvet-social-subtitle">Follow our work</p>

          {/* Large editorial Instagram handle */}
          <p className="ms-velvet-social-handle ms-velvet-display">{instagramHandle}</p>
        </div>
      </div>

      {/* Continuous cinematic marquee — pauses on hover */}
      {images.length > 0 ? (
        <div className="ms-velvet-social-strip" role="list" aria-label="Recent posts">
          <div className="ms-velvet-social-track">
            {[...images, ...images].map((src, i) => (
              <div key={i} className="ms-velvet-social-thumb" role="listitem">
                <Image
                  src={src}
                  alt={i < images.length ? `Post ${i + 1}` : ""}
                  fill
                  sizes="(max-width: 767px) 45vw, 220px"
                  className="ms-velvet-photo"
                  aria-hidden={i >= images.length}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="ms-velvet-social-inner">
        <div {...velvetReveal("fade", 80, "ms-velvet-social-cta-row")}>
          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ms-velvet-social-link"
            >
              <InstagramIcon />
              {ctaLabel}
            </a>
          ) : (
            <span className="ms-velvet-social-link">
              <InstagramIcon />
              {ctaLabel}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
