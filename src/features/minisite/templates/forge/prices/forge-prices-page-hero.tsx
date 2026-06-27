import { resolveForgePricesHeroImage } from "@/lib/minisite/forge-media";
import { forgeHeroEnter, forgeReveal } from "@/lib/minisite/forge-motion";
import { nicolesPricesPageTitle } from "@/lib/minisite/nicoles-prices-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../../nicoles/nicoles-media";
import { ForgeScrollCue } from "../forge-scroll-cue";

type ForgePricesPageHeroProps = {
  content: MinisiteContent;
};

const DEFAULT_INTRO =
  "Präzise Schnitte und faire Preise — direkt aus unserem Leistungskatalog.";

export function ForgePricesPageHero({ content }: ForgePricesPageHeroProps) {
  const imagePath = resolveForgePricesHeroImage(content);
  const title = nicolesPricesPageTitle(content);
  const intro =
    content.sections?.prices?.text?.trim() ||
    content.sections?.prices?.subtitle?.trim() ||
    DEFAULT_INTRO;

  return (
    <section
      id="ms-forge-prices-hero"
      className="ms-forge-prices-hero ms-forge-prices-hero--fullscreen ms-forge-section ms-cinema-section"
      data-forge-hero
      aria-labelledby="forge-prices-page-heading"
    >
      <div className="ms-forge-prices-hero-shell">
        <div {...forgeHeroEnter(0)} className="ms-forge-prices-hero-media" aria-hidden>
          <NicolesPhoto
            path={imagePath}
            priority
            sizes="100vw"
            color
            className="ms-forge-prices-hero-ken"
          />
        </div>

        <div className="ms-forge-prices-hero-overlay" aria-hidden />
        <div className="ms-forge-prices-hero-vignette" aria-hidden />
        <div className="ms-forge-hero-noise" aria-hidden />

        <div className="ms-forge-prices-hero-content">
          <span {...forgeReveal("fade", 80)} className="ms-forge-prices-hero-mark" aria-hidden>
            ◆
          </span>
          <h1
            {...forgeReveal("up", 140)}
            id="forge-prices-page-heading"
            className="ms-forge-prices-hero-title"
          >
            {title}
          </h1>
          <p {...forgeReveal("up", 220)} className="ms-forge-prices-hero-intro">
            {intro}
          </p>
        </div>

        <ForgeScrollCue href="#ms-forge-prices-catalog" />
      </div>
    </section>
  );
}
