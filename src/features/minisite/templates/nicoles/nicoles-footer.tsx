import type { ShopPublicData } from "@/lib/validations/public-shop";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";

import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

import { NicolesSocialIcons } from "./nicoles-social-icons";

type NicolesFooterProps = {
  data: ShopPublicData;
};

export function NicolesFooter({ data }: NicolesFooterProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("nicoles");
  const address = content.address?.trim();
  const phone = content.phone?.trim();
  const email = content.email?.trim();
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const showLocation = content.show?.location !== false;
  const showHours = content.show?.hours !== false;
  const showSocial = content.show?.social !== false;
  const hours = formatOpeningHoursLines(shop.opening_hours);
  const year = new Date().getFullYear();

  if (!showLocation && !showHours && !showSocial) {
    return null;
  }

  return (
    <footer id={anchors.contact} className="ms-nicoles-footer ms-nicoles-section ms-cinema-section" aria-label="Kontakt">
      <div className="ms-nicoles-footer-pattern" aria-hidden />
      <div className="relative mx-auto grid max-w-5xl gap-[var(--space-8)] px-[var(--space-4)] py-[var(--space-12)] min-[768px]:grid-cols-3">
        {showLocation ? (
          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)]">Termin vereinbaren</h2>
            <div className="mt-[var(--space-3)] space-y-[var(--space-2)] text-sm leading-relaxed text-[color:color-mix(in_oklch,var(--ms-nicoles-cream)_85%,transparent)]">
              {address ? <p>{address}</p> : null}
              {phone ? (
                <p>
                  Tel{" "}
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
                    {phone}
                  </a>
                </p>
              ) : null}
              {email ? (
                <p>
                  <a href={`mailto:${email}`} className="underline-offset-4 hover:underline">
                    {email}
                  </a>
                </p>
              ) : null}
            </div>
          </article>
        ) : null}

        {showHours ? (
          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)]">Öffnungszeiten</h2>
            <dl className="mt-[var(--space-3)] space-y-[var(--space-2)]">
              {hours.map((line) => (
                <div key={line.label} className="flex justify-between gap-[var(--space-4)] text-sm">
                  <dt className="text-[color:color-mix(in_oklch,var(--ms-nicoles-cream)_72%,transparent)]">
                    {line.label}
                  </dt>
                  <dd className="tabular-nums text-[color:var(--ms-nicoles-cream)]">{line.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ) : null}

        {showSocial ? (
          <article className="min-[768px]:text-right">
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)] sr-only">Social</h2>
            <div className="mt-[var(--space-2)] flex min-[768px]:justify-end">
              <NicolesSocialIcons links={links} email={email} />
            </div>
          </article>
        ) : null}
      </div>

      <div className="ms-nicoles-footer-gold-bar">
        <div className="mx-auto flex max-w-5xl flex-col gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] text-[0.6875rem] min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p>
            © {year} {shop.name} – Alle Rechte vorbehalten.
          </p>
          <p className="flex flex-wrap gap-[var(--space-3)]">
            <span>Kontakt</span>
            <span>Impressum</span>
            <span>Datenschutz</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
