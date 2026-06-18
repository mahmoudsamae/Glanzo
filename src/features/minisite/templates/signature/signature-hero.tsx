import Image from "next/image";

import type { ShopPublicData } from "@/lib/validations/public-shop";

import { formatHoursTodayLine } from "@/lib/minisite/hours-today";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import { shopMediaPublicUrl } from "../../lib/media-url";

import { SocialLinksRow } from "../../components/social-links-row";
import { BookCta } from "../../sections/book-cta";

type SignatureHeroProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
};

function headlineWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function SignatureHeroSection({ data, bookHref, preview = false }: SignatureHeroProps) {
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

  return (
    <section
      className="ms-signature-hero ms-cinema-hero relative min-h-[min(78vh,40rem)] overflow-hidden"
      data-signature-hero
      aria-label="Hero"
    >
      <div className="ms-signature-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="ms-signature-orbs pointer-events-none absolute inset-0" aria-hidden>
        <span className="ms-signature-orb ms-signature-orb--a" />
        <span className="ms-signature-orb ms-signature-orb--b" />
      </div>

      {coverUrl ? (
        <div className="ms-cinema-cover-wrap absolute inset-x-0 top-0 aspect-[4/3] w-full opacity-60">
          <Image src={coverUrl} alt="" fill priority sizes="100vw" className="ms-cinema-cover object-cover" />
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[inherit] flex-col items-center justify-end px-[var(--space-4)] py-[var(--space-12)] text-center">
        <div className="ms-signature-hero-plane flex w-full max-w-md flex-col items-center gap-[var(--space-4)]">
          {logoUrl ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[color:var(--ms-border)]">
              <Image src={logoUrl} alt="" fill sizes="80px" className="object-cover" />
            </div>
          ) : null}
          <h1 className="font-display text-3xl leading-tight text-[color:var(--ms-text)]">
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="ms-cinema-word" style={{ ["--word-i" as string]: index }}>
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
          {preview ? (
            <span className="rounded-full border border-[color:var(--ms-border)] px-[var(--space-6)] py-[var(--space-3)] text-md">
              Jetzt buchen
            </span>
          ) : (
            <BookCta href={bookHref} label="Jetzt buchen" suspended={isSuspended} cinema className="rounded-full" />
          )}
        </div>
      </div>
    </section>
  );
}
