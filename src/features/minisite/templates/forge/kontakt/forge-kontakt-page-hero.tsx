import { resolveForgeKontaktHeroImage } from "@/lib/minisite/forge-media";
import { forgeHeroEnter, forgeReveal } from "@/lib/minisite/forge-motion";
import { nicolesKontaktPageTitle } from "@/lib/minisite/nicoles-kontakt-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../../nicoles/nicoles-media";
import { ForgeScrollCue } from "../forge-scroll-cue";

type ForgeKontaktPageHeroProps = {
  content: MinisiteContent;
};

const DEFAULT_INTRO = "Telefon, Termin oder Nachricht — wir sind für dich da.";

export function ForgeKontaktPageHero({ content }: ForgeKontaktPageHeroProps) {
  const imagePath = resolveForgeKontaktHeroImage(content);
  const title = nicolesKontaktPageTitle(content);
  const intro = content.sections?.contact?.eyebrow?.trim() || DEFAULT_INTRO;

  return (
    <section
      id="ms-forge-kontakt-hero"
      className="ms-forge-kontakt-hero ms-forge-kontakt-hero--fullscreen ms-forge-section ms-cinema-section"
      data-forge-hero
      aria-labelledby="forge-kontakt-page-heading"
    >
      <div className="ms-forge-kontakt-hero-shell">
        <div {...forgeHeroEnter(0)} className="ms-forge-kontakt-hero-media" aria-hidden>
          <NicolesPhoto
            path={imagePath}
            priority
            sizes="100vw"
            color
            className="ms-forge-kontakt-hero-ken"
          />
        </div>

        <div className="ms-forge-kontakt-hero-overlay" aria-hidden />
        <div className="ms-forge-kontakt-hero-vignette" aria-hidden />
        <div className="ms-forge-hero-noise" aria-hidden />

        <div className="ms-forge-kontakt-hero-content">
          <span {...forgeReveal("fade", 80)} className="ms-forge-kontakt-hero-mark" aria-hidden>
            ◆
          </span>
          <h1
            {...forgeReveal("up", 140)}
            id="forge-kontakt-page-heading"
            className="ms-forge-kontakt-hero-title"
          >
            {title}
          </h1>
          <p {...forgeReveal("up", 220)} className="ms-forge-kontakt-hero-intro">
            {intro}
          </p>
        </div>

        <ForgeScrollCue href="#ms-forge-kontakt-reach" />
      </div>
    </section>
  );
}
