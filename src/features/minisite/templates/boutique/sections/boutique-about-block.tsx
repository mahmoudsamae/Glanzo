import Image from "next/image";

import type { AboutBlock } from "@/lib/minisite/about-blocks";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";
import { BookCta } from "../../../sections/book-cta";

type BoutiqueAboutBlockProps = {
  block: AboutBlock;
  content: MinisiteContent;
  shopName: string;
  bookHref: string;
  preview?: boolean;
  suspended?: boolean;
};

function mediaUrl(path?: string | null): string | null {
  return path ? shopMediaPublicUrl(path) : null;
}

function paragraphs(text?: string): string[] {
  if (!text?.trim()) {
    return [];
  }
  return text.split(/\n{2,}|\n/).map((line) => line.trim()).filter(Boolean);
}

export function BoutiqueAboutBlock({
  block,
  content,
  shopName,
  bookHref,
  preview = false,
  suspended = false,
}: BoutiqueAboutBlockProps) {
  switch (block.type) {
    case "page_hero":
      return <PageHeroBlock block={block} content={content} shopName={shopName} />;
    case "intro":
      return <IntroBlock block={block} />;
    case "team_heading":
      return <TeamHeadingBlock block={block} />;
    case "team_profile":
      return <TeamProfileBlock block={block} />;
    case "salon_intro":
      return <SalonIntroBlock block={block} />;
    case "image_stack":
      return <ImageStackBlock block={block} />;
    case "language_band":
      return <LanguageBandBlock block={block} />;
    case "collage":
      return <CollageBlock block={block} />;
    case "cta":
      return (
        <CtaBlock block={block} bookHref={bookHref} preview={preview} suspended={suspended} />
      );
    case "split_footer":
      return <SplitFooterBlock block={block} content={content} shopName={shopName} />;
    default:
      return null;
  }
}

function PageHeroBlock({
  block,
  content,
  shopName,
}: {
  block: AboutBlock;
  content: MinisiteContent;
  shopName: string;
}) {
  const url = mediaUrl(block.image_path ?? content.cover_path);
  const logoUrl = mediaUrl(content.logo_path);

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--page-hero">
      {url ? (
        <div className="ms-boutique-about-page-hero-media relative aspect-[4/5] w-full sm:aspect-[16/10]">
          <Image src={url} alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="ms-boutique-about-page-hero-overlay absolute inset-0" aria-hidden />
        </div>
      ) : (
        <div className="ms-boutique-about-page-hero-fallback aspect-[4/5] w-full sm:aspect-[16/10]" aria-hidden />
      )}
      <div className="ms-boutique-about-page-hero-brand px-[var(--space-4)] py-[var(--space-6)] text-center">
        {logoUrl ? (
          <span className="relative mx-auto mb-[var(--space-3)] block size-12 overflow-hidden rounded-full border border-[color:var(--ms-accent)]">
            <Image src={logoUrl} alt="" fill sizes="48px" className="object-cover" />
          </span>
        ) : (
          <span className="ms-boutique-about-sparkle mx-auto mb-[var(--space-2)] block" aria-hidden>
            ✦
          </span>
        )}
        <p className="font-display text-lg uppercase tracking-[0.2em] text-[color:var(--ms-boutique-ink)]">
          {block.title?.trim() || shopName}
        </p>
        {block.subtitle ? (
          <p className="mt-[var(--space-1)] text-xs lowercase tracking-[0.08em] text-[color:var(--ms-boutique-ink-muted)]">
            {block.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function IntroBlock({ block }: { block: AboutBlock }) {
  const lines = paragraphs(block.text);

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--intro px-[var(--space-4)] py-[var(--space-10)]">
      <div className="mx-auto max-w-2xl text-center">
        <span className="ms-boutique-about-sparkle mb-[var(--space-2)] inline-block" aria-hidden>
          ✦
        </span>
        <h2 className="font-display text-3xl text-[color:var(--ms-boutique-ink)]">
          {block.title?.trim() || "Über uns"}
        </h2>
        {block.eyebrow ? (
          <p className="ms-boutique-about-tagline mt-[var(--space-4)]">{block.eyebrow}</p>
        ) : null}
        <div className="mt-[var(--space-6)] space-y-[var(--space-4)] text-left">
          {lines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className="text-md leading-relaxed text-[color:var(--ms-boutique-ink-muted)]"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamHeadingBlock({ block }: { block: AboutBlock }) {
  if (!block.eyebrow?.trim()) {
    return null;
  }

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--team-heading px-[var(--space-4)] py-[var(--space-6)] text-center">
      <p className="ms-boutique-about-tagline">{block.eyebrow}</p>
    </div>
  );
}

function TeamProfileBlock({ block }: { block: AboutBlock }) {
  const url = mediaUrl(block.image_path);
  const lines = paragraphs(block.text);
  const reversed = block.layout === "reversed";

  if (!url && !block.title?.trim() && lines.length === 0) {
    return null;
  }

  return (
    <div
      className={`ms-boutique-about-block ms-boutique-about-block--team-profile ${
        reversed ? "ms-boutique-about-block--reversed" : ""
      }`}
    >
      {url ? (
        <div className="ms-boutique-about-team-photo relative aspect-[4/3] w-full md:aspect-auto md:min-h-[22rem] md:w-1/2">
          <Image src={url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      ) : null}
      <div className="ms-boutique-about-team-copy px-[var(--space-4)] py-[var(--space-8)] md:flex md:w-1/2 md:items-center">
        <div className="md:max-w-md">
          {block.title ? (
            <h3 className="font-display text-2xl text-[color:var(--ms-boutique-ink)]">{block.title}</h3>
          ) : null}
          {block.subtitle ? (
            <p className="ms-boutique-about-role mt-[var(--space-2)]">{block.subtitle}</p>
          ) : null}
          <div className="mt-[var(--space-4)] space-y-[var(--space-3)]">
            {lines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="text-md leading-relaxed text-[color:var(--ms-boutique-ink-muted)]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SalonIntroBlock({ block }: { block: AboutBlock }) {
  const paths = block.image_paths?.filter(Boolean) ?? [];
  const lines = paragraphs(block.text);

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--salon-intro px-[var(--space-4)] py-[var(--space-10)]">
      <div className="mx-auto max-w-3xl text-center">
        {block.eyebrow ? <p className="ms-boutique-about-tagline">{block.eyebrow}</p> : null}
        {block.title ? (
          <h3 className="mt-[var(--space-4)] font-display text-2xl text-[color:var(--ms-boutique-ink)] sm:text-3xl">
            {block.title}
          </h3>
        ) : null}
        {lines.length > 0 ? (
          <p className="mx-auto mt-[var(--space-4)] max-w-2xl text-md leading-relaxed text-[color:var(--ms-boutique-ink-muted)]">
            {lines.join(" ")}
          </p>
        ) : null}
      </div>
      {paths.length > 0 ? (
        <div className="mx-auto mt-[var(--space-8)] grid max-w-4xl grid-cols-1 gap-[var(--space-2)] sm:grid-cols-2">
          {paths.slice(0, 2).map((path, index) => {
            const url = mediaUrl(path);
            if (!url) return null;
            return (
              <figure key={`${path}-${index}`} className="relative aspect-[4/3] overflow-hidden">
                <Image src={url} alt="" fill sizes="(max-width: 640px) 100vw, 480px" className="object-cover" />
              </figure>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ImageStackBlock({ block }: { block: AboutBlock }) {
  const paths = block.image_paths?.filter(Boolean) ?? [];
  if (paths.length === 0) {
    return null;
  }

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--image-stack">
      {paths.map((path, index) => {
        const url = mediaUrl(path);
        if (!url) return null;
        return (
          <figure key={`${path}-${index}`} className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
            <Image src={url} alt="" fill sizes="100vw" className="object-cover" />
          </figure>
        );
      })}
    </div>
  );
}

function LanguageBandBlock({ block }: { block: AboutBlock }) {
  if (!block.text?.trim()) {
    return null;
  }

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--language-band px-[var(--space-4)] py-[var(--space-10)] text-center">
      <p className="mx-auto max-w-2xl font-display text-lg leading-relaxed text-[color:var(--ms-boutique-cream)] sm:text-xl">
        {block.text}
      </p>
    </div>
  );
}

function CollageBlock({ block }: { block: AboutBlock }) {
  const paths = block.image_paths?.filter(Boolean) ?? [];
  if (paths.length === 0) {
    return null;
  }

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--collage">
      <div className="ms-boutique-about-collage-grid">
        {paths.slice(0, 4).map((path, index) => {
          const url = mediaUrl(path);
          if (!url) return null;
          return (
            <figure
              key={`${path}-${index}`}
              className={`ms-boutique-about-collage-cell ms-boutique-about-collage-cell--${index + 1} relative overflow-hidden`}
            >
              <Image src={url} alt="" fill sizes="(max-width: 768px) 50vw, 240px" className="object-cover" />
            </figure>
          );
        })}
      </div>
    </div>
  );
}

function CtaBlock({
  block,
  bookHref,
  preview,
  suspended,
}: {
  block: AboutBlock;
  bookHref: string;
  preview: boolean;
  suspended: boolean;
}) {
  const label = block.title?.trim() || "Jetzt Termin vereinbaren";

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--cta px-[var(--space-4)] py-[var(--space-8)]">
      <div className="flex justify-center">
        {suspended ? (
          <p className="text-sm text-[color:var(--ms-boutique-ink-muted)]">Online-Buchung pausiert</p>
        ) : preview ? (
          <span className="ms-boutique-pill-cta">{label}</span>
        ) : (
          <BookCta href={bookHref} label={label} suspended={suspended} className="ms-boutique-pill-cta" />
        )}
      </div>
    </div>
  );
}

function SplitFooterBlock({
  block,
  content,
  shopName,
}: {
  block: AboutBlock;
  content: MinisiteContent;
  shopName: string;
}) {
  const paths = block.image_paths?.filter(Boolean) ?? [];
  const left = mediaUrl(paths[0]);
  const right = mediaUrl(paths[1]);
  const logoUrl = mediaUrl(content.logo_path);

  if (!left && !right) {
    return null;
  }

  return (
    <div className="ms-boutique-about-block ms-boutique-about-block--split-footer relative">
      <div className="ms-boutique-about-split-grid">
        {left ? (
          <figure className="relative min-h-[12rem]">
            <Image src={left} alt="" fill sizes="50vw" className="object-cover grayscale" />
          </figure>
        ) : (
          <div className="min-h-[12rem] bg-[color:var(--ms-boutique-teal)]" aria-hidden />
        )}
        {right ? (
          <figure className="relative min-h-[12rem]">
            <Image src={right} alt="" fill sizes="50vw" className="object-cover grayscale" />
          </figure>
        ) : (
          <div className="min-h-[12rem] bg-[color:var(--ms-boutique-teal-deep)]" aria-hidden />
        )}
      </div>
      <div className="ms-boutique-about-split-logo" aria-hidden>
        {logoUrl ? (
          <span className="relative block size-14 overflow-hidden rounded-full border border-[color:var(--ms-accent)]">
            <Image src={logoUrl} alt="" fill sizes="56px" className="object-cover" />
          </span>
        ) : null}
        <p className="mt-[var(--space-2)] font-display text-sm uppercase tracking-[0.16em] text-[color:var(--ms-boutique-cream)]">
          {shopName}
        </p>
      </div>
    </div>
  );
}
