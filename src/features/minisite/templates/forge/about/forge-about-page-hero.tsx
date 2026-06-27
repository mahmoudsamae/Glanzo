import { resolveNicolesAboutHeroImage } from "@/lib/minisite/nicoles-stock-images";
import type { AboutBlock } from "@/lib/minisite/about-blocks";
import { forgeHeroEnter, forgeReveal } from "@/lib/minisite/forge-motion";
import { splitParagraphs } from "@/lib/minisite/nicoles-about-blocks";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../../nicoles/nicoles-media";
import { NicolesPillLink } from "../../nicoles/nicoles-pill-link";
import { ForgeShineFrame } from "../forge-shine-frame";
import { ForgeScrollCue } from "../forge-scroll-cue";

type ForgeAboutPageHeroProps = {
  block?: AboutBlock;
  content: MinisiteContent;
  title?: string;
  text?: string;
  bookHref: string;
};

export function ForgeAboutPageHero({
  block,
  content,
  title = "Über uns",
  text,
  bookHref,
}: ForgeAboutPageHeroProps) {
  const imagePath = resolveNicolesAboutHeroImage(content, block?.image_path);
  const paragraphs = splitParagraphs(text);
  const hasBody = paragraphs.length > 0;
  const panelReveal = forgeReveal("up", 120, "ms-forge-about-page-hero-panel");

  return (
    <section
      className="ms-forge-about-page-hero ms-forge-section ms-cinema-section"
      data-forge-hero
      aria-labelledby="forge-about-page-heading"
    >
      <div className="ms-forge-about-page-hero-shell">
        <div {...forgeHeroEnter(0)} className="ms-forge-about-page-hero-media" aria-hidden>
          <NicolesPhoto
            path={imagePath}
            priority
            sizes="100vw"
            color
            className="ms-forge-about-page-hero-ken"
          />
        </div>

        <div className="ms-forge-about-page-hero-overlay" aria-hidden />
        <div className="ms-forge-about-page-hero-vignette" aria-hidden />
        <div className="ms-forge-hero-noise" aria-hidden />

        <div className="ms-forge-about-page-hero-content">
          <ForgeShineFrame
            variant="panel"
            className={panelReveal.className}
            style={panelReveal.style}
          >
            <div {...forgeReveal("fade", 60)} className="ms-forge-about-page-hero-mark-row">
              <span className="ms-forge-about-page-hero-line" aria-hidden />
              <span className="ms-forge-about-page-mark" aria-hidden>
                ✦
              </span>
              <span className="ms-forge-about-page-hero-line" aria-hidden />
            </div>

            <h1
              {...forgeReveal("up", 140)}
              id="forge-about-page-heading"
              className="ms-forge-about-page-title"
            >
              {title}
            </h1>
            <div className="ms-forge-about-page-hero-title-rule" aria-hidden />

            {hasBody ? (
              <div className="ms-forge-about-page-story" data-forge-stagger>
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 24)}`}
                    {...forgeReveal("up", 200 + index * 70)}
                    className={index === 0 ? "ms-forge-about-page-story-lead" : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            <div {...forgeReveal("fade", hasBody ? 300 : 220)} className="ms-forge-about-page-intro-cta">
              <NicolesPillLink href={bookHref} label="Termin buchen" />
            </div>
          </ForgeShineFrame>
        </div>
        <ForgeScrollCue href="#ms-forge-about-team" />
      </div>
    </section>
  );
}
