import Image from "next/image";

import type { ShopPublicData } from "@/lib/validations/public-shop";

import { formatHoursTodayLine } from "@/lib/minisite/hours-today";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import { shopMediaPublicUrl } from "../lib/media-url";

import { SocialLinksRow } from "../components/social-links-row";
import { BookCta } from "./book-cta";

type HeroProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
};

function headlineWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function HeroSection({ data, bookHref, preview = false }: HeroProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const isSuspended = shop.status === "suspended";
  const coverUrl = content.cover_path ? shopMediaPublicUrl(content.cover_path) : null;
  const logoUrl = content.logo_path ? shopMediaPublicUrl(content.logo_path) : null;
  const headline = content.hero_headline?.trim() || shop.name;
  const hoursToday = formatHoursTodayLine(shop.opening_hours, shop.timezone);
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const words = headlineWords(headline);

  return (
    <section
      className="ms-cinema-hero relative overflow-hidden"
      data-cinema-hero
      aria-label="Hero"
    >
      {coverUrl ? (
        <div className="ms-cinema-cover-wrap relative aspect-[4/3] w-full sm:aspect-[21/9]">
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="ms-cinema-cover object-cover"
          />
          <div className="ms-cinema-scrim pointer-events-none absolute inset-0" aria-hidden />
        </div>
      ) : null}

      <div
        className={`ms-cinema-hero-plane flex flex-col items-center gap-[var(--space-4)] px-[var(--space-4)] text-center ${
          coverUrl ? "-mt-[var(--space-12)] relative z-10 pb-[var(--space-8)]" : "py-[var(--space-12)]"
        }`}
      >
        {logoUrl ? (
          <div className="ms-cinema-logo-chip relative h-20 w-20 overflow-hidden rounded-full border-2 border-[color:var(--ms-border)] bg-[color:var(--ms-bg-elevated)] shadow-sm">
            <Image src={logoUrl} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ) : null}

        <div className="flex max-w-lg flex-col gap-[var(--space-2)]">
          <h1 className="font-display text-2xl leading-tight text-[color:var(--ms-text)] sm:text-3xl">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="ms-cinema-word"
                style={{ ["--word-i" as string]: index }}
              >
                {word}
                {index < words.length - 1 ? "\u00a0" : ""}
              </span>
            ))}
          </h1>
          {content.about && content.show?.about !== false ? (
            <p className="text-md text-[color:var(--ms-text-muted)]">{content.about}</p>
          ) : null}
          <p className="text-sm text-[color:var(--ms-text-muted)]">{hoursToday}</p>
          <SocialLinksRow links={links} variant="compact" />
          {isSuspended ? (
            <p className="text-md text-[color:var(--ms-text-muted)]">
              Derzeit keine Online-Buchungen.
            </p>
          ) : null}
        </div>

        {preview ? (
          <span className="inline-flex rounded-md border border-[color:var(--ms-border)] px-[var(--space-6)] py-[var(--space-3)] text-md text-[color:var(--ms-text-muted)]">
            Jetzt buchen
          </span>
        ) : (
          <BookCta href={bookHref} label="Jetzt buchen" suspended={isSuspended} cinema />
        )}
      </div>
    </section>
  );
}
