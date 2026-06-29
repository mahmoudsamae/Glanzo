import Image from "next/image";
import Link from "next/link";

import { velvetHeroEnter } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";

const VELVET_TOP_ID = "ms-velvet-top";
const VELVET_ABOUT_ID = "ms-velvet-about";

type VelvetHeroSectionProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
};

type HeroField = "eyebrow" | "title" | "subtitle" | "text" | "cta_label" | "badge_tiny";

function getHeroField(
  content: ShopPublicData["minisite"]["content"],
  field: HeroField,
  fallback: string,
): string {
  const block = content.sections?.hero;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (field === "title") return content.hero_headline?.trim() || fallback;
  return fallback;
}

function splitHeadline(
  title: string,
  subtitle?: string,
): { line1: string; line2: string; line3: string } {
  if (subtitle?.trim()) {
    const parts = subtitle.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return { line1: title.trim(), line2: parts[0] ?? "", line3: parts[1] ?? "" };
    return { line1: title.trim(), line2: subtitle.trim(), line3: "" };
  }

  const pipeParts = title.split("|").map((p) => p.trim()).filter(Boolean);
  if (pipeParts.length >= 2) {
    return { line1: pipeParts[0] ?? "", line2: pipeParts[1] ?? "", line3: pipeParts[2] ?? "" };
  }

  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return { line1: words.slice(0, 2).join(" "), line2: words.slice(2).join(" "), line3: "" };
  }
  if (words.length === 2) return { line1: words[0] ?? "", line2: words[1] ?? "", line3: "" };
  return { line1: title.trim(), line2: "", line3: "" };
}

function resolveGalleryImages(content: ShopPublicData["minisite"]["content"]): string[] {
  const paths = content.sections?.gallery?.image_paths;
  if (Array.isArray(paths) && paths.length > 0) {
    return paths.slice(0, 4).map((p) => shopMediaPublicUrl(p));
  }
  if (Array.isArray(content.gallery) && content.gallery.length > 0) {
    return (content.gallery as string[]).slice(0, 4).map((p) => shopMediaPublicUrl(p));
  }
  return [];
}

function heroVideoMime(path: string): string {
  return path.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
}

function VelvetBookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4 shrink-0">
      <path
        d="M6 2.5v1.25M14 2.5v1.25M3.75 7.5h12.5M5 4.75h10a1.25 1.25 0 0 1 1.25 1.25v9.5A1.25 1.25 0 0 1 15 16.75H5a1.25 1.25 0 0 1-1.25-1.25v-9.5A1.25 1.25 0 0 1 5 4.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* 16 intentionally-placed particles */
const PARTICLES = [
  { l: 12, b: 14 }, { l: 24, b: 22 }, { l: 38, b:  8 }, { l: 50, b: 30 },
  { l: 66, b: 12 }, { l: 78, b: 26 }, { l: 84, b: 18 }, { l: 18, b: 42 },
  { l: 42, b: 52 }, { l: 60, b: 36 }, { l: 72, b: 44 }, { l: 32, b: 58 },
  { l: 55, b: 62 }, { l: 88, b: 50 }, { l: 22, b: 70 }, { l: 64, b: 66 },
] as const;

export function VelvetHeroSection({ data, bookHref, preview = false }: VelvetHeroSectionProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const meta = VELVET_SECTION_META.hero;
  const isSuspended = shop.status === "suspended";

  const coverUrl =
    content.show?.cover !== false && content.cover_path
      ? shopMediaPublicUrl(content.cover_path)
      : null;

  const videoUrl =
    content.show?.cover !== false && content.cover_video_path
      ? shopMediaPublicUrl(content.cover_video_path)
      : null;

  const galleryImages = resolveGalleryImages(content);
  const slideImages = galleryImages.length > 0 ? galleryImages : coverUrl ? [coverUrl] : [];

  const eyebrow = getHeroField(content, "eyebrow", meta.defaults.eyebrow ?? "NAIL ATELIER");
  const title = getHeroField(content, "title", meta.defaults.title ?? "Nails as Art.");
  const subtitle = content.sections?.hero?.subtitle?.trim();
  const bodyText = getHeroField(
    content,
    "text",
    "Handcrafted nail art. Every set is a collaboration between artist and client.",
  );
  const { line1, line2, line3 } = splitHeadline(title, subtitle);

  const bookLabel =
    getHeroField(content, "cta_label", "") ||
    getHeroField(content, "badge_tiny", meta.defaults.badge_tiny ?? "Book Now");

  const aboutHref = `#${VELVET_ABOUT_ID}`;

  return (
    <section
      id={VELVET_TOP_ID}
      data-velvet-hero
      className="ms-velvet-hero"
      aria-label="Hero"
    >
      {/* ── Background media ── */}
      {videoUrl ? (
        <video
          className="ms-velvet-hero-bg-video"
          autoPlay
          muted
          loop
          playsInline
          poster={coverUrl ?? undefined}
          aria-hidden
          data-velvet-hero-video
        >
          <source src={videoUrl} type={heroVideoMime(content.cover_video_path ?? "")} />
        </video>
      ) : slideImages.length > 0 ? (
        slideImages.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="ms-velvet-hero-bg-slide"
            data-velvet-slide
            style={{ opacity: i === 0 ? 1 : 0, transition: "opacity 1.4s ease" }}
          />
        ))
      ) : (
        <div className="ms-velvet-hero-placeholder" aria-hidden />
      )}

      {/* ── Aurora layers ── */}
      <div className="ms-velvet-hero-aurora" aria-hidden>
        <div className="ms-velvet-hero-aurora-mid" />
      </div>

      {/* ── Diagonal light sweep ── */}
      <div className="ms-velvet-hero-sweep" aria-hidden />

      {/* ── Floating glass particles ── */}
      <div className="ms-velvet-hero-particles" aria-hidden>
        {PARTICLES.map(({ l, b }, i) => (
          <div
            key={i}
            className="ms-velvet-particle"
            style={{ left: `${l}%`, bottom: `${b}%` }}
          />
        ))}
      </div>

      {/* ── Primary pearl orb ── */}
      <div className="ms-velvet-hero-orb" aria-hidden>
        <div className="ms-velvet-hero-orb-glow" />
      </div>

      {/* ── Secondary pearl orb ── */}
      <div className="ms-velvet-hero-orb-2" aria-hidden />

      {/* ── Dark gradient overlay ── */}
      <div className="ms-velvet-hero-overlay" aria-hidden />

      {/* ── Main content ── */}
      <div className="ms-velvet-hero-inner">
        <p {...velvetHeroEnter(0, "ms-velvet-hero-eyebrow")}>
          <span className="ms-velvet-hero-eyebrow-line" aria-hidden />
          {eyebrow}
        </p>

        <h1 {...velvetHeroEnter(150, "ms-velvet-hero-headline ms-velvet-display")}>
          {line2 ? (
            <>
              <span className="ms-velvet-hero-headline-line">{line1}</span>
              <span className="ms-velvet-hero-headline-italic">{line2}</span>
              {line3 ? <span className="ms-velvet-hero-headline-line">{line3}</span> : null}
            </>
          ) : (
            <span className="ms-velvet-hero-headline-line">{line1}</span>
          )}
        </h1>

        {bodyText ? (
          <p {...velvetHeroEnter(280, "ms-velvet-hero-subtitle")}>{bodyText}</p>
        ) : null}

        <div {...velvetHeroEnter(380, "ms-velvet-hero-cta-row")}>
          {isSuspended ? (
            <span className="ms-velvet-hero-cta-primary opacity-70" aria-disabled="true">
              Online-Buchung pausiert
            </span>
          ) : preview ? (
            <span className="ms-velvet-hero-cta-primary">
              <VelvetBookIcon />
              {bookLabel}
            </span>
          ) : (
            <Link href={bookHref} scroll={false} className="ms-velvet-hero-cta-primary">
              <VelvetBookIcon />
              {bookLabel}
            </Link>
          )}

          <a href={aboutHref} className="ms-velvet-hero-cta-ghost">
            Our Work ↓
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href={aboutHref} className="ms-velvet-hero-scroll" aria-label="Scroll down">
        <span className="ms-velvet-hero-scroll-label">Scroll</span>
        <span className="ms-velvet-hero-scroll-line" />
      </a>

      {/* Slide dots */}
      {!videoUrl && slideImages.length > 1 ? (
        <div className="ms-velvet-hero-dots" aria-hidden>
          {slideImages.map((src, i) => (
            <button
              key={src}
              type="button"
              data-velvet-dot
              className={`ms-velvet-hero-dot ${i === 0 ? "ms-velvet-hero-dot--active" : ""}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
