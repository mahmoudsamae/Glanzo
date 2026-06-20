import Image from "next/image";
import Link from "next/link";

import { defaultNavLinksForTemplate } from "@/lib/minisite/template-anchors";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import type { ShopPublicData } from "@/lib/validations/public-shop";
import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

import { shopMediaPublicUrl } from "../../lib/media-url";
import { MeccaSocialPills } from "./mecca-social-pills";

type MeccaFooterProps = {
  data: ShopPublicData;
};

function MeccaCrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="ms-mecca-footer-crown">
      <path
        d="M4 17.5 6.2 8.8l3.3 2.8L12 6l2.5 5.6 3.3-2.8L20 17.5H4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 17.5h11M8 20.5h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function resolveFooterHref(href: string | undefined, shopSlug: string): string | null {
  if (!href || href === "__book__") return null;
  if (href === "/about") return `/s/${shopSlug}/about`;
  if (href === "/leistungen") return `/s/${shopSlug}/leistungen`;
  if (href === "/terminbuchung") return `/s/${shopSlug}/terminbuchung`;
  if (href === "/kontakt") return `/s/${shopSlug}/kontakt`;
  if (href.startsWith("#")) {
    const anchor = href.slice(1);
    if (anchor === "ms-nicoles-top" || anchor === "ms-mecca-top") return `/s/${shopSlug}`;
    if (anchor === "ms-nicoles-about" || anchor === "ms-mecca-about") return `/s/${shopSlug}/about`;
    if (anchor === "ms-nicoles-prices" || anchor === "ms-nicoles-services") {
      return `/s/${shopSlug}/leistungen`;
    }
    if (anchor === "ms-nicoles-contact" || anchor === "ms-mecca-contact") {
      return `/s/${shopSlug}/kontakt`;
    }
    return href;
  }
  if (href.startsWith("/")) return `/s/${shopSlug}${href}`;
  return href;
}

export function MeccaFooter({ data }: MeccaFooterProps) {
  const { shop, minisite } = data;
  const shopSlug = shop.slug;
  const content = minisite.content;
  const address = content.address?.trim();
  const phone = content.phone?.trim();
  const email = content.email?.trim();
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const showLocation = content.show?.location !== false;
  const showHours = content.show?.hours !== false;
  const showSocial = content.show?.social !== false;
  const hours = formatOpeningHoursLines(shop.opening_hours);
  const year = new Date().getFullYear();
  const logoUrl = content.logo_path ? shopMediaPublicUrl(content.logo_path) : null;
  const tagline =
    content.sections?.nav?.text?.trim() ||
    content.about?.trim() ||
    "Premium Hair · Styling · Beratung";

  const navLinks =
    content.nav_links?.filter((link) => link.visible !== false && link.label.trim()) ??
    defaultNavLinksForTemplate("nicoles").filter((link) => link.href !== "__book__");

  if (!showLocation && !showHours && !showSocial && navLinks.length === 0) {
    return null;
  }

  return (
    <footer id="ms-mecca-contact" className="ms-mecca-footer ms-mecca-section" aria-label="Footer">
      <div className="ms-mecca-footer-inner">
        <div className="ms-mecca-footer-grid">
          <article>
            <div className="ms-mecca-footer-brand-row">
              {logoUrl ? (
                <span className="relative block size-11 shrink-0 overflow-hidden rounded-full border border-[color:var(--ms-mecca-gold)]">
                  <Image src={logoUrl} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ) : (
                <MeccaCrownIcon />
              )}
              <p className="ms-mecca-footer-brand">{shop.name}</p>
            </div>
            <p className="ms-mecca-footer-tagline">{tagline}</p>
            {showSocial ? <MeccaSocialPills links={links} /> : null}
          </article>

          <article>
            <h2 className="ms-mecca-footer-heading">Navigation</h2>
            <nav aria-label="Footer Navigation">
              {navLinks.map((link) => {
                const resolved = resolveFooterHref(link.href, shopSlug);
                if (!resolved) return null;
                return (
                  <Link key={link.id} href={resolved} className="ms-mecca-footer-link">
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </article>

          <article>
            {showLocation ? (
              <>
                <h2 className="ms-mecca-footer-heading">Kontakt</h2>
                <div className="mt-[var(--space-2)] space-y-[var(--space-2)] text-sm leading-relaxed text-[color:var(--ms-mecca-muted)]">
                  {address ? <p>{address}</p> : null}
                  {phone ? (
                    <p>
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="text-[color:var(--ms-mecca-cream)] transition-colors hover:text-[color:var(--ms-mecca-gold)]"
                      >
                        {phone}
                      </a>
                    </p>
                  ) : null}
                  {email ? (
                    <p>
                      <a
                        href={`mailto:${email}`}
                        className="text-[color:var(--ms-mecca-cream)] transition-colors hover:text-[color:var(--ms-mecca-gold)]"
                      >
                        {email}
                      </a>
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {showHours ? (
              <>
                <h2 className={`ms-mecca-footer-heading ${showLocation ? "mt-[var(--space-6)]" : ""}`}>
                  Öffnungszeiten
                </h2>
                <dl className="mt-[var(--space-2)] space-y-[var(--space-2)]">
                  {hours.map((line) => (
                    <div key={line.label} className="flex justify-between gap-[var(--space-4)] text-sm">
                      <dt className="text-[color:var(--ms-mecca-muted)]">{line.label}</dt>
                      <dd className="tabular-nums text-[color:var(--ms-mecca-cream)]">{line.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
          </article>
        </div>

        <div className="ms-mecca-footer-bottom">
          <p>
            © {year} {shop.name}
          </p>
          <p>Powered by Glanzo</p>
        </div>
      </div>
    </footer>
  );
}
