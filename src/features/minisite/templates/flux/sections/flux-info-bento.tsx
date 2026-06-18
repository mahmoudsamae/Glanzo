import type { ShopPublicData } from "@/lib/validations/public-shop";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";

import { formatHoursTodayLine } from "@/lib/minisite/hours-today";
import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

import { SocialLinksRow } from "../../../components/social-links-row";

type FluxInfoBentoProps = {
  data: ShopPublicData;
};

export function FluxInfoBento({ data }: FluxInfoBentoProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const address = content.address?.trim();
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const showLocation = content.show?.location !== false;
  const showHours = content.show?.hours !== false;
  const showSocial = content.show?.social !== false;
  const mapsHref = links?.google_maps ?? null;
  const hours = formatOpeningHoursLines(shop.opening_hours);
  const todayLine = formatHoursTodayLine(shop.opening_hours, shop.timezone);

  if (!showLocation && !showHours && !showSocial) {
    return null;
  }

  return (
    <section aria-label="Standort und Öffnungszeiten" className="ms-flux-section px-[var(--space-4)] py-[var(--space-8)]">
      <p className="ms-flux-kicker mb-[var(--space-4)]">Infos</p>
      <div className="ms-flux-bento">
        {showLocation && address ? (
          <article className="ms-flux-bento-cell ms-flux-bento-cell--wide">
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ms-accent)]">Standort</p>
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[var(--space-2)] block text-md leading-snug text-[color:var(--ms-text)] underline-offset-4 hover:underline"
              >
                {address}
              </a>
            ) : (
              <p className="mt-[var(--space-2)] text-md leading-snug text-[color:var(--ms-text)]">{address}</p>
            )}
          </article>
        ) : null}

        {showHours ? (
          <article className="ms-flux-bento-cell">
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ms-accent)]">Heute</p>
            <p className="mt-[var(--space-2)] font-display text-lg leading-snug text-[color:var(--ms-text)]">
              {todayLine}
            </p>
          </article>
        ) : null}

        {showHours ? (
          <article className="ms-flux-bento-cell">
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ms-accent)]">Zeiten</p>
            <dl className="mt-[var(--space-2)] space-y-[var(--space-1)]">
              {hours.slice(0, 4).map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-[var(--space-2)] text-xs">
                  <dt className="text-[color:var(--ms-text-muted)]">{line.label}</dt>
                  <dd className="tabular-nums text-[color:var(--ms-text)]">{line.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ) : null}

        {showSocial ? (
          <article className="ms-flux-bento-cell ms-flux-bento-cell--wide">
            <p className="mb-[var(--space-2)] text-xs uppercase tracking-[0.22em] text-[color:var(--ms-accent)]">
              Folgen
            </p>
            <SocialLinksRow links={links} variant="full" />
          </article>
        ) : null}
      </div>
    </section>
  );
}
