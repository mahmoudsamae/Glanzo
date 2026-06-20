import { Instagram } from "lucide-react";

import { instagramProfileUrl } from "@/lib/minisite/instagram-url";
import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import { normalizeWhatsAppUrl } from "@/lib/validations/minisite-links";

type MeccaSocialPillsProps = {
  links: MinisiteLinks | undefined;
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4 shrink-0">
      <path
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.1c.2-.5.8-.5 1-.1l.3.6c.1.2.1.5 0 .7l-.2.3c-.1.2-.1.4 0 .6.4.7 1.1 1.3 1.9 1.6.2.1.4.1.6 0l.3-.2c.2-.1.5-.1.7 0l.6.3c.4.2.4.8-.1 1-.6.4-1.3.5-2 .2-1.2-.5-2.2-1.5-2.7-2.7-.3-.7-.2-1.4.2-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MeccaSocialPills({ links }: MeccaSocialPillsProps) {
  if (!links?.instagram && !links?.whatsapp) {
    return null;
  }

  return (
    <ul className="ms-mecca-footer-socials">
      {links?.instagram ? (
        <li>
          <a
            href={instagramProfileUrl(links.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="ms-mecca-footer-social-pill"
          >
            <Instagram className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            Instagram
          </a>
        </li>
      ) : null}
      {links?.whatsapp ? (
        <li>
          <a
            href={normalizeWhatsAppUrl(links.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="ms-mecca-footer-social-pill"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        </li>
      ) : null}
    </ul>
  );
}
