import Image from "next/image";

import { resolveForgeHeroImage } from "@/lib/minisite/forge-media";
import { forgeHeroEnter, forgeReveal } from "@/lib/minisite/forge-motion";
import { getForgeSectionField, FORGE_SECTION_META } from "@/lib/minisite/forge-sections";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { minisiteImageUrl } from "../../lib/media-url";
import { NicolesPhoto } from "../nicoles/nicoles-media";
import { ForgeLogoIcon } from "./forge-logo-icon";
import { ForgeScrollCue } from "./forge-scroll-cue";

type ForgeHeroSectionProps = {
  data: ShopPublicData;
};

export function ForgeHeroSection({ data }: ForgeHeroSectionProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("forge");
  const heroMeta = FORGE_SECTION_META.hero;

  const headline =
    content.hero_headline?.trim() ||
    getForgeSectionField(content, "hero", "title", heroMeta.defaults.title ?? shop.name);

  const eyebrow = getForgeSectionField(
    content,
    "hero",
    "eyebrow",
    "Barbershop · Herren · Style",
  );

  const subtext = getForgeSectionField(
    content,
    "about",
    "text",
    "Präzision, Atmosphäre und ein Look, der zu dir passt — vom klassischen Fade bis zum Signature Cut.",
  );

  const badgeTiny = getForgeSectionField(content, "hero", "badge_tiny", heroMeta.defaults.badge_tiny ?? "DEAL");
  const badgeMedium = getForgeSectionField(
    content,
    "hero",
    "badge_medium",
    heroMeta.defaults.badge_medium ?? "JEDEN DONNERSTAG",
  );
  const badgeLarge = getForgeSectionField(
    content,
    "hero",
    "badge_large",
    heroMeta.defaults.badge_large ?? "STUDENTEN TAG",
  );

  const logoPath = content.logo_path?.trim();
  const heroImage = resolveForgeHeroImage(content);
  const aboutHref = `#${anchors.about}`;

  return (
    <section
      id={anchors.top}
      data-forge-hero
      className="ms-forge-hero"
      aria-label="Hero"
    >
      <div className="ms-forge-hero-shell">
        <div {...forgeHeroEnter(0, "ms-forge-hero-media")} aria-hidden>
          <div className="ms-forge-hero-image-wrap">
            <NicolesPhoto
              path={heroImage}
              color
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
              className="ms-forge-hero-image !object-cover !object-center"
            />
          </div>
        </div>

        <div className="ms-forge-hero-overlay" aria-hidden />
        <div className="ms-forge-hero-vignette" aria-hidden />
        <div className="ms-forge-hero-noise" aria-hidden />

        <div className="ms-forge-hero-copy">
          <p {...forgeHeroEnter(0, "ms-forge-hero-eyebrow")}>{eyebrow}</p>

          <h1 {...forgeHeroEnter(80, "ms-forge-hero-title ms-forge-display")}>{headline}</h1>

          <p {...forgeHeroEnter(160, "ms-forge-hero-sub")}>{subtext}</p>

          <div {...forgeHeroEnter(240, "ms-forge-hero-badge")}>
            <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--ms-forge-copper)]">
              {badgeTiny}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ms-forge-muted)]">
              {badgeMedium}
            </span>
            <strong>{badgeLarge}</strong>
          </div>

          {logoPath ? (
            <div {...forgeHeroEnter(320)} className="ms-forge-hero-logo">
              <Image
                src={minisiteImageUrl(logoPath)}
                alt=""
                width={88}
                height={88}
                className="size-[4rem] rounded-full border border-[color:var(--ms-forge-copper)] object-contain p-1"
              />
            </div>
          ) : (
            <div {...forgeHeroEnter(320)} className="ms-forge-hero-logo">
              <ForgeLogoIcon className="size-16 text-[color:var(--ms-forge-copper)]" />
            </div>
          )}
        </div>

        <ForgeScrollCue href={aboutHref} />
      </div>
    </section>
  );
}
