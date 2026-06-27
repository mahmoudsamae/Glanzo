import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { forgeKontaktHoursSummary } from "@/lib/minisite/forge-kontakt-page";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import {
  resolveGoogleMapsHrefFromContent,
  resolveKontaktAddress,
  resolveKontaktEmail,
  resolveKontaktPhone,
} from "@/lib/minisite/nicoles-kontakt-page";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { ForgeKontaktReachSocial } from "./forge-kontakt-reach-social";

type ForgeKontaktReachRowProps = {
  data: ShopPublicData;
};

type ReachChipProps = {
  href?: string;
  label: string;
  value: string;
  icon: ReactNode;
  external?: boolean;
};

function ReachChip({ href, label, value, icon, external }: ReachChipProps) {
  const className = "ms-forge-kontakt-reach-chip";
  const body = (
    <>
      <span className="ms-forge-kontakt-reach-chip-icon" aria-hidden>
        {icon}
      </span>
      <span className="ms-forge-kontakt-reach-chip-copy">
        <span className="ms-forge-kontakt-reach-chip-label">{label}</span>
        <span className="ms-forge-kontakt-reach-chip-value">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {body}
      </a>
    );
  }

  return (
    <span className={`${className} ms-forge-kontakt-reach-chip--static`}>
      {body}
    </span>
  );
}

export function ForgeKontaktReachRow({ data }: ForgeKontaktReachRowProps) {
  const content = data.minisite.content;
  const showLocation = content.show?.location !== false;
  const showHours = content.show?.hours !== false;
  const showSocial = content.show?.social !== false;

  const phone = resolveKontaktPhone(content);
  const email = resolveKontaktEmail(content);
  const address = resolveKontaktAddress(content);
  const mapsHref = resolveGoogleMapsHrefFromContent(content, address);
  const hoursSummary = forgeKontaktHoursSummary(data);
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const hasSocial =
    showSocial && Boolean(links?.instagram || links?.tiktok || links?.whatsapp || links?.facebook);

  return (
    <section
      id="ms-forge-kontakt-reach"
      className="ms-forge-kontakt-reach ms-forge-section ms-cinema-section"
      aria-label="Direkt erreichbar"
    >
      <div {...forgeReveal("up", 60)} className="ms-forge-kontakt-reach-inner">
        <p className="ms-forge-kontakt-reach-eyebrow">Direkt erreichbar</p>

        <div className="ms-forge-kontakt-reach-track">
          <ReachChip
            href={`tel:${phone.replace(/\s/g, "")}`}
            label="Telefon"
            value={phone}
            icon={<Phone className="size-4" strokeWidth={1.5} />}
          />
          <ReachChip
            href={`mailto:${email}`}
            label="E-Mail"
            value={email}
            icon={<Mail className="size-4" strokeWidth={1.5} />}
          />
          {showLocation ? (
            <ReachChip
              href={mapsHref}
              label="Adresse"
              value={address}
              icon={<MapPin className="size-4" strokeWidth={1.5} />}
              external
            />
          ) : null}
          {showHours && hoursSummary ? (
            <ReachChip
              label="Öffnungszeiten"
              value={hoursSummary}
              icon={<Clock className="size-4" strokeWidth={1.5} />}
            />
          ) : null}
          {hasSocial ? <ForgeKontaktReachSocial links={links} /> : null}
        </div>
      </div>
    </section>
  );
}
