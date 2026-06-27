import Link from "next/link";

import { meccaReveal } from "@/lib/minisite/mecca-motion";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import { normalizeWhatsAppUrl } from "@/lib/validations/minisite-links";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";
import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

type MeccaContactSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

function getContactField(
  content: MinisiteContent,
  field: "eyebrow" | "title",
  fallback: string,
): string {
  const block = content.sections?.contact;
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function mapEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function MeccaContactSection({ data, preview = false }: MeccaContactSectionProps) {
  const { shop, minisite } = data;
  const content = minisite.content;

  if (content.show?.location === false && content.show?.hours === false) {
    return null;
  }

  const meta = MECCA_SECTION_META.contact;
  const title = getContactField(content, "title", meta.defaults.title ?? "Besuche uns.");
  const address = content.address?.trim();
  const phone = content.phone?.trim();
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const whatsapp = links?.whatsapp ? normalizeWhatsAppUrl(links.whatsapp) : null;
  const hours = formatOpeningHoursLines(shop.opening_hours);
  const showHours = content.show?.hours !== false;
  const showLocation = content.show?.location !== false;

  return (
    <section id="ms-mecca-contact" className="ms-mecca-contact ms-mecca-section" aria-label="Kontakt">
      <div className="ms-mecca-contact-grid">
        <div {...meccaReveal("left")} data-mecca-stagger>
          <p className="ms-mecca-services-eyebrow">
            {getContactField(content, "eyebrow", meta.defaults.eyebrow ?? "STANDORT & ZEITEN")}
          </p>
          <h2 className="ms-mecca-reviews-title text-left">{title}</h2>

          {showLocation && address ? (
            <div className="ms-mecca-contact-item ms-mecca-reveal ms-mecca-reveal--left">
              <span className="ms-mecca-contact-icon" aria-hidden>
                📍
              </span>
              <div>
                <p className="ms-mecca-contact-label">Adresse</p>
                <p className="ms-mecca-contact-value">{address}</p>
              </div>
            </div>
          ) : null}

          {phone || whatsapp ? (
            <div className="ms-mecca-contact-item ms-mecca-reveal ms-mecca-reveal--left">
              <span className="ms-mecca-contact-icon" aria-hidden>
                ☎
              </span>
              <div>
                <p className="ms-mecca-contact-label">Buchungen</p>
                {phone ? <p className="ms-mecca-contact-value">{phone}</p> : null}
                {links?.instagram ? (
                  <p className="ms-mecca-contact-value text-[color:var(--ms-mecca-muted)]">
                    {links.instagram}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {showHours ? (
            <div className="ms-mecca-contact-item ms-mecca-reveal ms-mecca-reveal--left">
              <span className="ms-mecca-contact-icon" aria-hidden>
                🕒
              </span>
              <div>
                <p className="ms-mecca-contact-label">Öffnungszeiten</p>
                <div className="ms-mecca-contact-value space-y-1">
                  {hours.map((line) => (
                    <p key={line.label}>
                      {line.label}: {line.value}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {whatsapp && !preview ? (
            <Link href={whatsapp} target="_blank" rel="noopener noreferrer" className="ms-mecca-contact-cta">
              Nachricht per WhatsApp
            </Link>
          ) : null}
        </div>

        {showLocation && address ? (
          <div {...meccaReveal("right", 140, "ms-mecca-contact-map")}>
            <iframe
              title="Standort"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl(address)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
