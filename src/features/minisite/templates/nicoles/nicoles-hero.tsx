import Image from "next/image";

import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { nicolesHeroCopy, nicolesHeroPhotos, NicolesPhoto } from "./nicoles-media";
import { NicolesLogoIcon } from "./nicoles-logo-icon";

type NicolesHeroSectionProps = {
  data: ShopPublicData;
};

export function NicolesHeroSection({ data }: NicolesHeroSectionProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("nicoles");
  const copy = nicolesHeroCopy(content, shop.name);
  const [photoA, photoB] = nicolesHeroPhotos(content);

  return (
    <section
      id={anchors.top}
      data-nicoles-hero
      className="ms-nicoles-hero-home ms-nicoles-section ms-cinema-section relative min-h-[100svh] overflow-hidden bg-[color:var(--ms-nicoles-teal)]"
      aria-label="Hero"
    >
      <div className="ms-nicoles-hero-home-pattern absolute inset-0" aria-hidden />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-6xl grid-cols-1 lg:grid-cols-[2fr_3fr]">
        <div className="relative flex flex-col items-center justify-center px-[var(--space-4)] py-[var(--space-12)] text-center lg:items-start lg:px-[var(--space-8)] lg:text-left">
          <div className="mb-[var(--space-5)]">
            {copy.logoUrl ? (
              <Image
                src={copy.logoUrl}
                alt=""
                width={120}
                height={120}
                className="mx-auto size-[7.5rem] rounded-full border-2 border-[color:var(--ms-accent)] object-cover lg:mx-0"
                priority
              />
            ) : (
              <NicolesLogoIcon className="mx-auto size-20 text-[color:var(--ms-nicoles-cream)] lg:mx-0 lg:size-24" />
            )}
          </div>

          <span className="ms-nicoles-sparkle mb-[var(--space-3)]" aria-hidden>
            ✦
          </span>

          <h1 className="ms-nicoles-display ms-nicoles-display-italic max-w-md text-[clamp(2rem,6vw,3.625rem)] leading-[1.08] text-white">
            {copy.headline}
          </h1>

          <div className="ms-nicoles-hero-badge absolute right-[8%] top-[18%] hidden lg:flex">
            <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--ms-nicoles-ink)]">
              {copy.badgeTiny}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--ms-nicoles-ink)]">
              {copy.badgeMedium}
            </p>
            <p className="mt-1 font-display text-lg font-bold uppercase leading-none text-white">
              {copy.badgeLarge}
            </p>
          </div>

          <div className="ms-nicoles-hero-badge ms-nicoles-hero-badge--mobile relative mt-[var(--space-6)] lg:hidden">
            <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--ms-nicoles-ink)]">
              {copy.badgeTiny}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--ms-nicoles-ink)]">
              {copy.badgeMedium}
            </p>
            <p className="mt-1 font-display text-base font-bold uppercase leading-none text-white">
              {copy.badgeLarge}
            </p>
          </div>
        </div>

        <div className="relative min-h-[18rem] lg:min-h-0">
          <div className="ms-nicoles-hero-cutouts absolute inset-0">
            <div className="ms-nicoles-hero-cutout ms-nicoles-hero-cutout--a relative">
              <NicolesPhoto path={photoA} priority sizes="(min-width:1024px) 35vw, 80vw" />
            </div>
            <div className="ms-nicoles-hero-cutout ms-nicoles-hero-cutout--b relative">
              <NicolesPhoto path={photoB} sizes="(min-width:1024px) 35vw, 70vw" />
            </div>
          </div>
        </div>
      </div>

      <a
        href={copy.aboutAnchor}
        className="ms-nicoles-scroll-cue absolute bottom-[var(--space-6)] left-1/2 z-20 -translate-x-1/2"
        aria-label="Weiter scrollen"
      >
        ↓
      </a>
    </section>
  );
}
