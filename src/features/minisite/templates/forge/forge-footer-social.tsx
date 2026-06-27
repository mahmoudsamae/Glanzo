import type { ReactNode } from "react";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

import { instagramProfileUrl } from "@/lib/minisite/instagram-url";
import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import { normalizeWhatsAppUrl } from "@/lib/validations/minisite-links";

type ForgeFooterSocialProps = {
  links: MinisiteLinks | undefined;
};

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[1.35rem] shrink-0">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function ForgeFooterSocial({ links }: ForgeFooterSocialProps) {
  if (!links?.instagram && !links?.tiktok && !links?.whatsapp && !links?.facebook) {
    return null;
  }

  const items: Array<{ key: string; href: string; label: string; icon: ReactNode }> = [];

  if (links?.whatsapp) {
    items.push({
      key: "whatsapp",
      href: normalizeWhatsAppUrl(links.whatsapp),
      label: "WhatsApp",
      icon: <MessageCircle strokeWidth={1.5} aria-hidden />,
    });
  }
  if (links?.instagram) {
    items.push({
      key: "instagram",
      href: instagramProfileUrl(links.instagram),
      label: "Instagram",
      icon: <Instagram strokeWidth={1.5} aria-hidden />,
    });
  }
  if (links?.facebook) {
    items.push({
      key: "facebook",
      href: links.facebook,
      label: "Facebook",
      icon: <Facebook strokeWidth={1.5} aria-hidden />,
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

  return (
    <ul className="ms-forge-footer-socials" aria-label="Social Media">
      {items.map(({ key, href, label, icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="ms-forge-footer-social-btn"
            aria-label={label}
            title={label}
          >
            {icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
