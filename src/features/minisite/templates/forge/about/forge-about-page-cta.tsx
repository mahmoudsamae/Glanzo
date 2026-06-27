import { forgeReveal } from "@/lib/minisite/forge-motion";

import { NicolesPillLink } from "../../nicoles/nicoles-pill-link";

type ForgeAboutPageCtaProps = {
  bookHref: string;
};

export function ForgeAboutPageCta({ bookHref }: ForgeAboutPageCtaProps) {
  return (
    <section
      id="ms-forge-about-cta"
      className="ms-forge-about-page-cta ms-forge-section ms-cinema-section"
      aria-label="Termin buchen"
    >
      <div className="ms-forge-about-page-cta-inner">
        <p {...forgeReveal("up", 0)} className="ms-forge-eyebrow">
          Dein nächster Termin
        </p>
        <h2 {...forgeReveal("up", 80)} className="ms-forge-section-title ms-forge-about-page-cta-title">
          Bereit für deinen neuen Look?
        </h2>
        <p {...forgeReveal("up", 140)} className="ms-forge-section-text ms-forge-about-page-cta-text">
          Buche jetzt online — schnell, unkompliziert und jederzeit.
        </p>
        <div {...forgeReveal("fade", 220)} className="ms-forge-about-page-cta-action">
          <NicolesPillLink href={bookHref} label="Jetzt Termin buchen" />
        </div>
      </div>
    </section>
  );
}
