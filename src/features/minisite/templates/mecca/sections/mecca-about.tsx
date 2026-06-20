import Image from "next/image";
import Link from "next/link";

import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

const MECCA_ABOUT_ID = "ms-mecca-about";

const DEFAULT_STATS = [
  "10+ Jahre Erfahrung",
  "500+ Kunden",
  "5★ Bewertungen",
] as const;

type MeccaAboutSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

type AboutField =
  | "eyebrow"
  | "title"
  | "subtitle"
  | "text"
  | "cta_label"
  | "badge_tiny"
  | "badge_medium"
  | "badge_large";

function getAboutField(
  content: MinisiteContent,
  field: AboutField,
  fallback: string,
): string {
  const block = content.sections?.about;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (field === "text") {
    return content.about?.trim() || fallback;
  }

  return fallback;
}

function splitAboutHeadline(
  title: string,
  subtitle: string | undefined,
): { line1: string; line2: string } {
  if (subtitle?.trim()) {
    return { line1: title.trim(), line2: subtitle.trim() };
  }

  const dotIndex = title.indexOf(".");
  if (dotIndex !== -1 && dotIndex < title.length - 1) {
    return {
      line1: title.slice(0, dotIndex + 1).trim(),
      line2: title.slice(dotIndex + 1).trim(),
    };
  }

  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return {
      line1: words.slice(0, -1).join(" "),
      line2: words[words.length - 1] ?? "",
    };
  }

  return { line1: title.trim(), line2: "" };
}

function resolveAboutImageUrl(content: MinisiteContent): string | null {
  const block = content.sections?.about;
  const blockPath = block?.image_path?.trim() || block?.image_paths?.[0]?.trim();
  if (blockPath) {
    return shopMediaPublicUrl(blockPath);
  }

  if (content.show?.cover !== false && content.cover_path?.trim()) {
    return shopMediaPublicUrl(content.cover_path);
  }

  return null;
}

function resolveAboutStats(content: MinisiteContent): string[] {
  const block = content.sections?.about;
  const stats = [
    block?.badge_tiny?.trim() || DEFAULT_STATS[0],
    block?.badge_medium?.trim() || DEFAULT_STATS[1],
    block?.badge_large?.trim() || DEFAULT_STATS[2],
  ].filter(Boolean);

  return stats.length > 0 ? stats : [...DEFAULT_STATS];
}

export function MeccaAboutSection({ data, shopSlug, preview = false }: MeccaAboutSectionProps) {
  const content = data.minisite.content;

  if (content.show?.about === false) {
    return null;
  }

  const meta = MECCA_SECTION_META.about;
  const eyebrow = getAboutField(content, "eyebrow", meta.defaults.eyebrow ?? "UNSERE GESCHICHTE");
  const title = getAboutField(content, "title", meta.defaults.title ?? "Leidenschaft für Schönheit.");
  const subtitle = content.sections?.about?.subtitle?.trim();
  const body = getAboutField(
    content,
    "text",
    meta.defaults.text ??
      "Wir setzen Maßstäbe in Handwerk, Beratung und Atmosphäre — für Looks, die zu dir passen.",
  );
  const ctaLabel = getAboutField(content, "cta_label", "Mehr über uns →");
  const { line1, line2 } = splitAboutHeadline(title, subtitle);
  const imageUrl = resolveAboutImageUrl(content);
  const stats = resolveAboutStats(content);
  const aboutHref = preview ? `#${MECCA_ABOUT_ID}` : `/s/${shopSlug}/about`;

  return (
    <section
      id={MECCA_ABOUT_ID}
      className="ms-mecca-about ms-mecca-section"
      aria-label="Über uns"
    >
      <div className="ms-mecca-about-grid">
        <div className="ms-mecca-about-media">
          <div className="ms-mecca-about-image-wrap">
            <div className="ms-mecca-about-image">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="ms-mecca-photo object-cover"
                />
              ) : (
                <div className="ms-mecca-about-placeholder" aria-hidden />
              )}
            </div>
          </div>
        </div>

        <div className="ms-mecca-about-copy">
          <p className="ms-mecca-about-label">{eyebrow}</p>

          <h2 className="ms-mecca-about-headline">
            <span className="ms-mecca-about-headline-white">{line1}</span>
            {line2 ? (
              <>
                {" "}
                <span className="ms-mecca-about-headline-gold">{line2}</span>
              </>
            ) : null}
          </h2>

          <p className="ms-mecca-about-body">{body}</p>

          <ul className="ms-mecca-about-stats">
            {stats.map((stat, index) => (
              <li key={`${stat}-${index}`} className="contents">
                {index > 0 ? (
                  <span className="ms-mecca-about-stat-sep" aria-hidden>
                    •
                  </span>
                ) : null}
                <span className="ms-mecca-about-stat">{stat}</span>
              </li>
            ))}
          </ul>

          {preview ? (
            <span className="ms-mecca-about-link">{ctaLabel}</span>
          ) : (
            <Link href={aboutHref} className="ms-mecca-about-link">
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
