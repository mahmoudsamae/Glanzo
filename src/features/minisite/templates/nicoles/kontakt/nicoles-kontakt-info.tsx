import {
  resolveGoogleMapsHref,
  resolveKontaktAddress,
  resolveKontaktEmail,
  resolveKontaktHours,
  resolveKontaktPhone,
} from "@/lib/minisite/nicoles-kontakt-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPillLink } from "../nicoles-pill-link";

type NicolesKontaktInfoProps = {
  data: ShopPublicData;
};

export function NicolesKontaktInfo({ data }: NicolesKontaktInfoProps) {
  const content = data.minisite.content;
  const phone = resolveKontaktPhone(content);
  const email = resolveKontaktEmail(content);
  const address = resolveKontaktAddress(content);
  const hours = resolveKontaktHours(data);
  const mapsHref = resolveGoogleMapsHref(content, address);

  return (
    <section
      className="ms-nicoles-kontakt-info ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-teal)] px-[var(--space-4)] py-[var(--space-14)]"
      aria-label="Kontaktinformationen"
    >
      <div className="mx-auto grid max-w-5xl gap-[var(--space-10)] min-[768px]:grid-cols-2 min-[768px]:gap-[var(--space-12)]">
        <div className="space-y-[var(--space-8)]">
          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)]">Telefon</h2>
            <p className="mt-[var(--space-3)] text-base text-[color:color-mix(in_oklch,var(--ms-nicoles-cream)_88%,transparent)]">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
                Tel {phone}
              </a>
            </p>
          </article>

          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)]">E-Mail</h2>
            <p className="mt-[var(--space-3)] text-base text-[color:color-mix(in_oklch,var(--ms-nicoles-cream)_88%,transparent)]">
              <a href={`mailto:${email}`} className="underline-offset-4 hover:underline">
                {email}
              </a>
            </p>
          </article>

          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)]">Öffnungszeiten</h2>
            <div className="mt-[var(--space-3)] space-y-[var(--space-2)] text-base text-[color:color-mix(in_oklch,var(--ms-nicoles-cream)_88%,transparent)]">
              {hours.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-[var(--space-6)]">
          <article>
            <h2 className="font-display text-xl text-[color:var(--ms-nicoles-cream)]">Adresse</h2>
            <p className="mt-[var(--space-3)] text-base leading-relaxed text-[color:color-mix(in_oklch,var(--ms-nicoles-cream)_88%,transparent)]">
              {address}
            </p>
          </article>

          <div>
            <NicolesPillLink href={mapsHref} label="ZU GOOGLE MAPS" />
          </div>
        </div>
      </div>
    </section>
  );
}
