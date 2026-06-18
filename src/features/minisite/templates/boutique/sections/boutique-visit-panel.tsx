import type { ShopPublicData } from "@/lib/validations/public-shop";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";

import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

import { SocialLinksRow } from "../../../components/social-links-row";

type BoutiqueVisitPanelProps = {
  data: ShopPublicData;
};

export function BoutiqueVisitPanel({ data }: BoutiqueVisitPanelProps) {
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
    <footer
      id="ms-boutique-contact"
      aria-label="Standort und Öffnungszeiten"
      className="ms-boutique-footer ms-boutique-section ms-cinema-section"
    >
      <div className="mx-auto grid max-w-5xl gap-[var(--space-8)] px-[var(--space-4)] py-[var(--space-12)] min-[768px]:grid-cols-3">
        {showLocation && address ? (
          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-boutique-cream)]">Termin vereinbaren</h2>
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[var(--space-3)] block text-md leading-relaxed text-[color:color-mix(in_oklch,var(--ms-boutique-cream)_82%,transparent)] underline-offset-4 hover:underline"
              >
                {address}
              </a>
            ) : (
              <p className="mt-[var(--space-3)] text-md leading-relaxed text-[color:color-mix(in_oklch,var(--ms-boutique-cream)_82%,transparent)]">
                {address}
              </p>
            )}
          </article>
        ) : null}

        {showHours ? (
          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-boutique-cream)]">Öffnungszeiten</h2>
            <dl className="mt-[var(--space-3)] space-y-[var(--space-2)]">
              {hours.map((line) => (
                <div key={line.label} className="flex justify-between gap-[var(--space-4)] text-sm">
                  <dt className="text-[color:color-mix(in_oklch,var(--ms-boutique-cream)_70%,transparent)]">
                    {line.label}
                  </dt>
                  <dd className="tabular-nums text-[color:var(--ms-boutique-cream)]">{line.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ) : null}

        {showSocial ? (
          <article className="min-[768px]:text-right">
            <h2 className="font-display text-xl text-[color:var(--ms-boutique-cream)]">Folgen</h2>
            <div className="mt-[var(--space-3)] flex min-[768px]:justify-end">
              <SocialLinksRow links={links} variant="full" />
            </div>
          </article>
        ) : null}
      </div>

      <div className="ms-boutique-footer-bar px-[var(--space-4)] py-[var(--space-3)] text-center text-xs text-[color:var(--ms-boutique-teal)]">
        {shop.name} · Online buchen · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
