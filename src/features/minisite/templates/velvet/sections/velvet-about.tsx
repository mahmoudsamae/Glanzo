import Image from "next/image";

import { velvetReveal } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

const VELVET_ABOUT_ID = "ms-velvet-about";

type VelvetAboutSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
  i18n: VelvetI18n;
};

type AboutField = "eyebrow" | "title" | "subtitle" | "text" | "cta_label" | "badge_tiny" | "badge_medium" | "badge_large";

function getField(content: MinisiteContent, field: AboutField, fallback: string): string {
  const block = content.sections?.about;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (field === "text") return content.about?.trim() || fallback;
  return fallback;
}

function resolveAboutImage(content: MinisiteContent): string | null {
  const block = content.sections?.about;
  const path = block?.image_path?.trim() || block?.image_paths?.[0]?.trim();
  if (path) return shopMediaPublicUrl(path);
  if (content.cover_path?.trim()) return shopMediaPublicUrl(content.cover_path);
  return null;
}

function resolveStats(content: MinisiteContent, i18n: VelvetI18n): { value: string; label: string }[] {
  const defaults = VELVET_SECTION_META.about.defaults;
  const block = content.sections?.about;

  const raw = [
    { value: block?.badge_tiny?.trim() || defaults.badge_tiny || "5+", label: i18n.about.statLabels.years },
    { value: block?.badge_medium?.trim() || defaults.badge_medium || "1000+", label: i18n.about.statLabels.sets },
    { value: block?.badge_large?.trim() || defaults.badge_large || "5★", label: i18n.about.statLabels.rated },
  ];

  return raw.filter((s) => s.value);
}

function splitHeadline(title: string, subtitle?: string): { line1: string; line2: string } {
  if (subtitle?.trim()) return { line1: title.trim(), line2: subtitle.trim() };
  const dotIdx = title.indexOf(".");
  if (dotIdx !== -1 && dotIdx < title.length - 1) {
    return { line1: title.slice(0, dotIdx + 1).trim(), line2: title.slice(dotIdx + 1).trim() };
  }
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) {
    return { line1: words.slice(0, -1).join(" "), line2: words[words.length - 1] ?? "" };
  }
  return { line1: title, line2: "" };
}

export function VelvetAboutSection({ data, shopSlug, preview = false, i18n }: VelvetAboutSectionProps) {
  const content = data.minisite.content;
  if (content.show?.about === false) return null;

  const meta = VELVET_SECTION_META.about;
  const eyebrow = getField(content, "eyebrow", meta.defaults.eyebrow ?? i18n.about.eyebrow);
  const title = getField(content, "title", meta.defaults.title ?? i18n.about.title);
  const subtitle = content.sections?.about?.subtitle?.trim();
  const body = getField(content, "text", meta.defaults.text ?? i18n.about.text);
  const ctaLabel = getField(content, "cta_label", meta.defaults.cta_label ?? i18n.about.ctaLabel);
  const { line1, line2 } = splitHeadline(title, subtitle);
  const imageUrl = resolveAboutImage(content);
  const stats = resolveStats(content, i18n);
  const firstStat = stats[0];

  return (
    <section id={VELVET_ABOUT_ID} className="ms-velvet-about" aria-label="About">
      <div className="ms-velvet-about-inner">
        <div className="ms-velvet-about-grid">
          {/* Copy */}
          <div {...velvetReveal("left", 0)}>
            <p className="ms-velvet-about-eyebrow">{eyebrow}</p>

            <h2 className="ms-velvet-about-headline ms-velvet-display">
              {line1}
              {line2 ? (
                <>
                  {" "}
                  <em>{line2}</em>
                </>
              ) : null}
            </h2>

            <p className="ms-velvet-about-body">{body}</p>

            {stats.length > 0 ? (
              <ul className="ms-velvet-about-stats">
                {stats.map((stat, i) => (
                  <li key={i} className="ms-velvet-about-stat-item">
                    <span className="ms-velvet-about-stat-value ms-velvet-display">{stat.value}</span>
                    <span className="ms-velvet-about-stat-label">{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <span className="ms-velvet-about-link">{ctaLabel}</span>
          </div>

          {/* Image */}
          <div {...velvetReveal("right", 150, "ms-velvet-about-media")}>
            <div className="ms-velvet-about-frame">
              {/* Decorative floating glass orbs */}
              <div
                className="ms-velvet-about-deco"
                style={{ width: "4.5rem", height: "4.5rem", top: "-1.75rem", right: "0.5rem" }}
                aria-hidden
              />
              <div
                className="ms-velvet-about-deco"
                style={{ width: "2.75rem", height: "2.75rem", bottom: "18%", left: "-1.25rem", animationDelay: "-5s" }}
                aria-hidden
              />

              {/* Floating glass tag */}
              <div className="ms-velvet-about-glass-tag" aria-hidden>
                <span className="ms-velvet-about-glass-tag-dot" />
                {i18n.about.glassTag}
              </div>

              <div className="ms-velvet-about-image">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="ms-velvet-photo"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(155deg, var(--ms-velvet-blush) 0%, var(--ms-velvet-cream) 100%)",
                    }}
                    aria-hidden
                  />
                )}
              </div>

              {/* Floating badge */}
              {firstStat ? (
                <div className="ms-velvet-about-badge" aria-hidden>
                  <span className="ms-velvet-about-badge-number ms-velvet-display">
                    {firstStat.value}
                  </span>
                  <span className="ms-velvet-about-badge-label">{firstStat.label}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
