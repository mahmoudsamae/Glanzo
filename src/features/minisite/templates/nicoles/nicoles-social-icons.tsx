import { Instagram, Mail, MessageCircle } from "lucide-react";

import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import { normalizeWhatsAppUrl } from "@/lib/validations/minisite-links";
import { instagramProfileUrl } from "../../lib/instagram-url";

type NicolesSocialIconsProps = {
  links: MinisiteLinks | undefined;
  email?: string | null;
};

export function NicolesSocialIcons({ links, email }: NicolesSocialIconsProps) {
  if (!links && !email) return null;

  const items: Array<{ key: string; href: string; label: string; Icon: typeof Instagram }> = [];

  if (links?.whatsapp) {
    items.push({
      key: "whatsapp",
      href: normalizeWhatsAppUrl(links.whatsapp),
      label: "WhatsApp",
      Icon: MessageCircle,
    });
  }
  if (links?.instagram) {
    items.push({
      key: "instagram",
      href: instagramProfileUrl(links.instagram),
      label: "Instagram",
      Icon: Instagram,
    });
  }
  if (email) {
    items.push({ key: "mail", href: `mailto:${email}`, label: "E-Mail", Icon: Mail });
  }

  if (items.length === 0) return null;

  return (
    <ul className="flex items-center gap-[var(--space-4)]">
      {items.map(({ key, href, label, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="ms-nicoles-social-icon inline-flex size-8 items-center justify-center text-[color:var(--ms-nicoles-cream)]"
          >
            <Icon className="size-8" strokeWidth={1.25} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
