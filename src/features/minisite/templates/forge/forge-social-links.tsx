import { Instagram } from "lucide-react";

import { instagramProfileUrl } from "@/lib/minisite/instagram-url";
import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";

type ForgeSocialLinksProps = {
  links: MinisiteLinks | undefined;
  legacyInstagram?: string | null;
  className?: string;
};

function instagramHandle(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("@")) {
    return trimmed;
  }
  const fromUrl = trimmed.match(/instagram\.com\/([^/?#]+)/i)?.[1];
  if (fromUrl) {
    return `@${fromUrl}`;
  }
  return `@${trimmed.replace(/^@/, "")}`;
}

function tiktokHandle(url: string): string {
  const trimmed = url.trim();
  const fromUrl = trimmed.match(/tiktok\.com\/@([^/?#]+)/i)?.[1];
  if (fromUrl) {
    return `@${fromUrl}`;
  }
  return "TikTok";
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4 shrink-0">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function ForgeSocialLinks({ links, legacyInstagram, className }: ForgeSocialLinksProps) {
  const resolved = resolveMinisiteLinks(links, legacyInstagram);
  const instagram = resolved?.instagram;
  const tiktok = resolved?.tiktok;

  if (!instagram && !tiktok) {
    return null;
  }

  return (
    <ul className={className ?? "ms-forge-hero-socials"} aria-label="Social Media">
      {instagram ? (
        <li>
          <a
            href={instagramProfileUrl(instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="ms-forge-hero-social-pill"
          >
            <Instagram className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span>{instagramHandle(instagram)}</span>
          </a>
        </li>
      ) : null}
      {tiktok ? (
        <li>
          <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="ms-forge-hero-social-pill"
          >
            <TikTokIcon />
            <span>{tiktokHandle(tiktok)}</span>
          </a>
        </li>
      ) : null}
    </ul>
  );
}
