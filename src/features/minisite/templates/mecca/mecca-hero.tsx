import Image from "next/image";
import Link from "next/link";

import { meccaHeroEnter } from "@/lib/minisite/mecca-motion";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";

const MECCA_TOP_ID = "ms-mecca-top";
const MECCA_ABOUT_ID = "ms-mecca-about";

type MeccaHeroSectionProps = {
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
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (field === "title") {
    return content.hero_headline?.trim() || fallback;
  }

  return fallback;
}

function splitHeroHeadline(
  title: string,
  subtitle: string | undefined,
): { line1: string; line2: string; line3: string } {
  if (subtitle?.trim()) {
    const parts = subtitle.split("|").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { line1: title.trim(), line2: parts[0] ?? "", line3: parts[1] ?? "" };
    }
    return { line1: title.trim(), line2: subtitle.trim(), line3: "" };
  }

  const pipeParts = title.split("|").map((part) => part.trim()).filter(Boolean);
  if (pipeParts.length >= 3) {
    return { line1: pipeParts[0] ?? "", line2: pipeParts[1] ?? "", line3: pipeParts[2] ?? "" };
  }

  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return {
      line1: words.slice(0, 2).join(" "),
      line2: words.slice(2, -1).join(" ") || (words[2] ?? ""),
      line3: words[words.length - 1] ?? "",
    };
  }

  const dotIndex = title.indexOf(".");
  if (dotIndex !== -1) {
    return {
      line1: title.slice(0, dotIndex + 1).trim(),
      line2: title.slice(dotIndex + 1).trim(),
      line3: "",
    };
  }

  return { line1: title.trim(), line2: "", line3: "" };
}

function MeccaHeroBookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4 shrink-0">
      <path
        d="M6 2.5v1.25M14 2.5v1.25M3.75 7.5h12.5M5 4.75h10a1.25 1.25 0 0 1 1.25 1.25v9.5A1.25 1.25 0 0 1 15 16.75H5a1.25 1.25 0 0 1-1.25-1.25v-9.5A1.25 1.25 0 0 1 5 4.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.25 10.25h2.1M10.65 10.25H12.75M7.25 12.75h5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MeccaHeroSection({ data, bookHref, preview = false }: MeccaHeroSectionProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const meta = MECCA_SECTION_META.hero;
  const isSuspended = shop.status === "suspended";

  const coverUrl =
    content.show?.cover !== false && content.cover_path
      ? shopMediaPublicUrl(content.cover_path)
      : null;

  const eyebrow = getHeroField(content, "eyebrow", meta.defaults.eyebrow ?? "PREMIUM SALON");
  const title = getHeroField(content, "title", meta.defaults.title ?? "Erlebe deinen besten Look.");
  const subtitle = content.sections?.hero?.subtitle?.trim();
  const { line1, line2, line3 } = splitHeroHeadline(title, subtitle);

  const bookLabel =
    getHeroField(content, "cta_label", "") ||
    getHeroField(content, "badge_tiny", meta.defaults.badge_tiny ?? "Jetzt buchen");

  const learnMoreLabel = "Mehr erfahren →";
  const aboutHref = `#${MECCA_ABOUT_ID}`;
  const sideLabel = content.sections?.hero?.text?.trim() || shop.name;

  return (
    <section id={MECCA_TOP_ID} data-mecca-hero className="ms-mecca-hero" aria-label="Hero">
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="ms-mecca-hero-bg"
        />
      ) : (
        <div className="ms-mecca-hero-bg ms-mecca-hero-placeholder" aria-hidden>
          <div className="ms-mecca-hero-placeholder-pattern" />
        </div>
      )}

      <div className="ms-mecca-hero-overlay" aria-hidden />

      <p className="ms-mecca-hero-side-label" aria-hidden>
        {sideLabel}
      </p>

      <div className="ms-mecca-hero-inner">
        <p {...meccaHeroEnter(0, "ms-mecca-hero-eyebrow")}>
          <svg viewBox="0 0 8 8" aria-hidden className="ms-mecca-hero-eyebrow-dot size-1.5">
            <circle cx="4" cy="4" r="3.5" fill="currentColor" />
          </svg>
          {eyebrow}
        </p>

        <div aria-hidden {...meccaHeroEnter(80, "ms-mecca-hero-divider")} />

        <h1 {...meccaHeroEnter(140, "ms-mecca-display")}>
          <span className="ms-mecca-hero-title-white">{line1}</span>
          {line2 ? <span className="ms-mecca-hero-title-gold">{line2}</span> : null}
          {line3 ? <span className="ms-mecca-hero-title-white">{line3}</span> : null}
        </h1>

        <div {...meccaHeroEnter(260, "ms-mecca-hero-cta-row")}>
          {isSuspended ? (
            <span className="ms-mecca-hero-cta-primary opacity-70" aria-disabled="true">
              Online-Buchung pausiert
            </span>
          ) : preview ? (
            <span className="ms-mecca-hero-cta-primary">
              <MeccaHeroBookIcon />
              {bookLabel}
            </span>
          ) : (
            <Link href={bookHref} scroll={false} className="ms-mecca-hero-cta-primary">
              <MeccaHeroBookIcon />
              {bookLabel}
            </Link>
          )}

          <Link href={aboutHref} className="ms-mecca-hero-cta-ghost">
            {learnMoreLabel}
          </Link>
        </div>
      </div>

      <a href={aboutHref} className="ms-mecca-hero-scroll" aria-label="Weiter scrollen">
        <span className="ms-mecca-hero-scroll-line" />
      </a>
    </section>
  );
}
