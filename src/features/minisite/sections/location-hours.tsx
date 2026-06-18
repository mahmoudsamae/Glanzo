import type { ShopPublicData } from "@/lib/validations/public-shop";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";

import { SocialLinksRow } from "../components/social-links-row";
import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

type LocationHoursProps = {
  data: ShopPublicData;
};

export function LocationHoursSection({ data }: LocationHoursProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const address = content.address?.trim();
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const showLocation = content.show?.location !== false;
  const showHours = content.show?.hours !== false;
  const showSocial = content.show?.social !== false;
  const mapsHref = links?.google_maps ?? null;

  const hours = formatOpeningHoursLines(shop.opening_hours);

  if (!showLocation && !showHours && !showSocial) {
    return null;
  }

  return (
    <section
      aria-label="Standort und Öffnungszeiten"
      className="ms-cinema-section border-t border-[color:var(--ms-border-subtle)] px-[var(--space-4)] py-[var(--space-8)]"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-[var(--space-6)]">
        {showLocation && address ? (
          <div className="flex flex-col gap-[var(--space-2)] text-center">
            <h2 className="font-display text-xl text-[color:var(--ms-text)]">Standort</h2>
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-[color:var(--ms-text-muted)] underline-offset-4 hover:underline"
              >
                {address}
              </a>
            ) : (
              <p className="text-md text-[color:var(--ms-text-muted)]">{address}</p>
            )}
          </div>
        ) : null}

        {showHours ? (
          <div className="flex flex-col gap-[var(--space-4)]">
            <h2 className="text-center font-display text-xl text-[color:var(--ms-text)]">
              Öffnungszeiten
            </h2>
            <dl className="flex flex-col gap-[var(--space-2)]">
              {hours.map((line) => (
                <div
                  key={line.label}
                  className="flex items-baseline justify-between gap-[var(--space-4)] border-b border-[color:var(--ms-border-subtle)] pb-[var(--space-2)] last:border-b-0"
                >
                  <dt className="text-sm text-[color:var(--ms-text-muted)]">{line.label}</dt>
                  <dd className="text-data text-sm text-[color:var(--ms-text)]">{line.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-center text-xs text-[color:var(--ms-text-muted)]">
              Zeiten in {shop.timezone.replace(/_/g, " ")}
            </p>
          </div>
        ) : null}

        {showSocial ? <SocialLinksRow links={links} variant="full" /> : null}
      </div>
    </section>
  );
}
