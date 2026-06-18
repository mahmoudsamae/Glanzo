import Image from "next/image";

import type { ShopPublicData } from "@/lib/validations/public-shop";

import { formatHoursTodayLine } from "@/lib/minisite/hours-today";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import { shopMediaPublicUrl } from "../../lib/media-url";

import { SocialLinksRow } from "../../components/social-links-row";
import { BookCta } from "../../sections/book-cta";

type FluxHeroProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
};

function headlineWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function FluxHeroSection({ data, bookHref, preview = false }: FluxHeroProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const isSuspended = shop.status === "suspended";
  const coverUrl =
    content.show?.cover !== false && content.cover_path ? shopMediaPublicUrl(content.cover_path) : null;
  const logoUrl = content.logo_path ? shopMediaPublicUrl(content.logo_path) : null;
  const headline = content.hero_headline?.trim() || shop.name;
  const hoursToday = formatHoursTodayLine(shop.opening_hours, shop.timezone);
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const words = headlineWords(headline);
  const notice = content.booking_notice?.trim();
  const marqueeText = notice || "Online buchen · Sofort bestätigt · Walk-ins willkommen";

  return (
    <section className="ms-flux-hero ms-cinema-hero" data-flux-hero aria-label="Hero">
      <div className="ms-flux-aurora pointer-events-none" aria-hidden />
      <div className="ms-flux-scanlines pointer-events-none" aria-hidden />
      <div className="ms-flux-scan-beam pointer-events-none" aria-hidden />
      <div className="ms-flux-grid-floor pointer-events-none" aria-hidden />

      {coverUrl ? (
        <div className="ms-flux-cover-strip ms-cinema-cover-wrap pointer-events-none">
          <Image src={coverUrl} alt="" fill priority sizes="100vw" className="ms-cinema-cover object-cover" />
          <div className="ms-flux-cover-glitch" aria-hidden />
        </div>
      ) : null}

      <div className="ms-flux-hero-inner">
        <div className="flex items-start gap-[var(--space-4)]">
          {logoUrl ? (
            <div className="ms-flux-logo-frame">
              <div className="ms-flux-logo-inner">
                <Image src={logoUrl} alt="" fill sizes="88px" className="object-cover" />
              </div>
            </div>
          ) : (
            <p className="ms-flux-kicker">Studio</p>
          )}
        </div>

        <div className="ms-flux-hero-panel flex flex-col gap-[var(--space-4)]">
          <h1 className="font-display text-[clamp(2rem,7vw,3.25rem)] leading-[0.95] text-[color:var(--ms-text)] uppercase">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="ms-flux-word"
                style={{ ["--word-i" as string]: index }}
              >
                {word}
                {index < words.length - 1 ? "\u00a0" : ""}
              </span>
            ))}
          </h1>

          {content.about && content.show?.about !== false ? (
            <p className="max-w-md text-md leading-relaxed text-[color:var(--ms-text-muted)]">{content.about}</p>
          ) : null}

          <p className="text-sm uppercase tracking-wider text-[color:var(--ms-text-muted)]">{hoursToday}</p>
          <SocialLinksRow links={links} variant="compact" />
        </div>

        <div className="ms-flux-marquee-wrap" aria-hidden={!notice}>
          {preview ? (
            <p className="px-[var(--space-3)] text-xs uppercase tracking-[0.08em] text-[color:var(--ms-text-muted)]">
              {marqueeText}
            </p>
          ) : (
            <div className="ms-flux-marquee-track">
              <span>{marqueeText}</span>
              <span aria-hidden>{marqueeText}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:gap-[var(--space-4)]">
          {isSuspended ? (
            <p className="text-md text-[color:var(--ms-text-muted)]">Derzeit keine Online-Buchungen.</p>
          ) : preview ? (
            <span className="ms-flux-book-cta inline-flex bg-[color:var(--ms-bg-elevated)] px-[var(--space-6)] py-[var(--space-3)] text-md uppercase tracking-wider text-[color:var(--ms-text-muted)]">
              Termin sichern
            </span>
          ) : (
            <BookCta
              href={bookHref}
              label="Termin sichern"
              suspended={isSuspended}
              cinema
              className="ms-flux-book-cta rounded-none px-[var(--space-8)] uppercase tracking-wider"
            />
          )}
        </div>
      </div>
    </section>
  );
}
