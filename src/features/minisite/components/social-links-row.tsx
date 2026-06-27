import {
  Facebook,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
} from "lucide-react";

import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import { normalizeWhatsAppUrl } from "@/lib/validations/minisite-links";
import { instagramProfileUrl } from "@/lib/minisite/instagram-url";
import { normalizeGoogleMapsUrl } from "@/lib/minisite/google-maps-url";

type SocialLinksRowProps = {
  links: MinisiteLinks | undefined;
  legacyInstagram?: string | null;
  /** Compact row under hero hours line. */
  variant?: "compact" | "full";
  /** Use google_maps as address link when address text shown elsewhere. */
  addressHref?: string | null;
};

type LinkItem = {
  key: string;
  href: string;
  label: string;
  Icon: typeof Instagram;
};

function buildItems(links: MinisiteLinks | undefined, legacyInstagram?: string | null): LinkItem[] {
  const items: LinkItem[] = [];
  const instagram = links?.instagram ?? legacyInstagram?.trim();
  if (instagram) {
    items.push({
      key: "instagram",
      href: instagramProfileUrl(instagram),
      label: "Instagram",
      Icon: Instagram,
    });
  }
  if (links?.facebook) {
    items.push({ key: "facebook", href: links.facebook, label: "Facebook", Icon: Facebook });
  }
  if (links?.tiktok) {
    items.push({ key: "tiktok", href: links.tiktok, label: "TikTok", Icon: Music2 });
  }
  if (links?.whatsapp) {
    items.push({
      key: "whatsapp",
      href: normalizeWhatsAppUrl(links.whatsapp),
      label: "WhatsApp",
      Icon: MessageCircle,
    });
  }
  if (links?.google_maps) {
    items.push({
      key: "google_maps",
      href: normalizeGoogleMapsUrl(links.google_maps),
      label: "Google Maps",
      Icon: MapPin,
    });
  }
  if (links?.website) {
    items.push({ key: "website", href: links.website, label: "Website", Icon: Globe });
  }
  return items;
}

export function SocialLinksRow({
  links,
  legacyInstagram,
  variant = "full",
  addressHref,
}: SocialLinksRowProps) {
  const items = buildItems(links, legacyInstagram);
  if (items.length === 0 && !addressHref) {
    return null;
  }

  const sizeClass =
    variant === "compact"
      ? "min-h-11 min-w-11"
      : "min-h-11 min-w-11 rounded-full border border-[color:var(--ms-border-subtle)]";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-[var(--space-2)] ${
        variant === "compact" ? "pt-[var(--space-1)]" : "pt-[var(--space-2)]"
      }`}
      aria-label="Social Links"
    >
      {addressHref ? (
        <a
          href={addressHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center text-[color:var(--ms-accent-on-bg)] ${sizeClass}`}
          aria-label="Adresse auf Google Maps"
        >
          <MapPin className="size-5" strokeWidth={1.5} aria-hidden />
        </a>
      ) : null}
      {items.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center text-[color:var(--ms-accent-on-bg)] transition-opacity hover:opacity-80 ${sizeClass}`}
          aria-label={label}
        >
          <Icon className="size-5" strokeWidth={1.5} aria-hidden />
        </a>
      ))}
    </div>
  );
}
