import { Instagram, Mail, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import { normalizeWhatsAppUrl } from "@/lib/validations/minisite-links";
import { instagramProfileUrl } from "@/lib/minisite/instagram-url";

type NicolesSocialIconsProps = {
  links: MinisiteLinks | undefined;
  email?: string | null;
};

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-8">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function NicolesSocialIcons({ links, email }: NicolesSocialIconsProps) {
  if (!links && !email) return null;

  const items: Array<{ key: string; href: string; label: string; icon: ReactNode }> = [];

  if (links?.whatsapp) {
    items.push({
      key: "whatsapp",
      href: normalizeWhatsAppUrl(links.whatsapp),
      label: "WhatsApp",
      icon: <MessageCircle className="size-8" strokeWidth={1.25} aria-hidden />,
    });
  }
  if (links?.instagram) {
    items.push({
      key: "instagram",
      href: instagramProfileUrl(links.instagram),
      label: "Instagram",
      icon: <Instagram className="size-8" strokeWidth={1.25} aria-hidden />,
    });
  }
  if (links?.tiktok) {
    items.push({
      key: "tiktok",
      href: links.tiktok,
      label: "TikTok",
      icon: <TikTokIcon />,
    });
  }
  if (email) {
    items.push({
      key: "mail",
      href: `mailto:${email}`,
      label: "E-Mail",
      icon: <Mail className="size-8" strokeWidth={1.25} aria-hidden />,
    });
  }

  if (items.length === 0) return null;

  return (
    <ul className="flex items-center gap-[var(--space-4)]">
      {items.map(({ key, href, label, icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="ms-nicoles-social-icon inline-flex size-8 items-center justify-center text-[color:var(--ms-nicoles-cream)]"
          >
            {icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
