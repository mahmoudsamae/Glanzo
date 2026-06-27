"use client";

import type { ReactNode } from "react";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import { resolveGoogleMapsHref } from "@/lib/minisite/google-maps-url";
import type { ShopPublicData } from "@/lib/validations/public-shop";
import { resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

import { ForgeFooterSocial } from "./forge-footer-social";

type ForgeFooterProps = {
  data: ShopPublicData;
};

type ContactCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
};

function ContactCard({ label, value, icon, onClick, href }: ContactCardProps) {
  const className = "ms-forge-footer-contact-card";
  const body = (
    <>
      <span className="ms-forge-footer-contact-icon" aria-hidden>
        {icon}
      </span>
      <span className="ms-forge-footer-contact-copy">
        <span className="ms-forge-footer-contact-label">{label}</span>
        <span className="ms-forge-footer-contact-value">{value}</span>
      </span>
      <ChevronRight className="ms-forge-footer-contact-chevron" strokeWidth={1.5} aria-hidden />
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${className} ms-forge-footer-contact-card--link`}>
        {body}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  );
}

export function ForgeFooter({ data }: ForgeFooterProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("forge");
  const address = content.address?.trim();
  const phone = content.phone?.trim();
  const email = content.email?.trim();
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const showLocation = content.show?.location !== false;
  const showHours = content.show?.hours !== false;
  const showSocial = content.show?.social !== false;
  const hours = formatOpeningHoursLines(shop.opening_hours);
  const year = new Date().getFullYear();
  const hasSocial =
    showSocial &&
    Boolean(links?.instagram || links?.tiktok || links?.whatsapp || links?.facebook);

  const [phoneOpen, setPhoneOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  if (!showLocation && !showHours && !hasSocial) {
    return null;
  }

  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";
  const mapHref = resolveGoogleMapsHref({ googleMaps: links?.google_maps, address });

  return (
    <footer id={anchors.contact} className="ms-forge-footer" aria-label="Kontakt">
      <div className="ms-forge-footer-pattern" aria-hidden />
      <div className="ms-forge-footer-glow" aria-hidden />

      <div className="ms-forge-footer-inner">
        {showLocation ? (
          <section className="ms-forge-footer-col" aria-labelledby="forge-footer-contact-heading">
            <p className="ms-forge-footer-eyebrow">Kontakt</p>
            <h2 id="forge-footer-contact-heading" className="ms-forge-footer-heading">
              Termin vereinbaren
            </h2>
            <div className="ms-forge-footer-contact-list">
              {address ? (
                <ContactCard
                  label="Adresse"
                  value={address}
                  icon={<MapPin className="size-4" strokeWidth={1.5} />}
                  onClick={() => setMapOpen(true)}
                />
              ) : null}
              {phone ? (
                <ContactCard
                  label="Telefon"
                  value={phone}
                  icon={<Phone className="size-4" strokeWidth={1.5} />}
                  onClick={() => setPhoneOpen(true)}
                />
              ) : null}
              {email ? (
                <ContactCard
                  label="E-Mail"
                  value={email}
                  icon={<Mail className="size-4" strokeWidth={1.5} />}
                  href={`mailto:${email}`}
                />
              ) : null}
            </div>
          </section>
        ) : null}

        {showHours ? (
          <section className="ms-forge-footer-col" aria-labelledby="forge-footer-hours-heading">
            <p className="ms-forge-footer-eyebrow">Wann wir da sind</p>
            <h2 id="forge-footer-hours-heading" className="ms-forge-footer-heading">
              Öffnungszeiten
            </h2>
            <div className="ms-forge-footer-hours-panel">
              <dl className="ms-forge-footer-hours">
                {hours.map((line) => {
                  const closed =
                    line.value.toLowerCase().includes("geschlossen") ||
                    line.value.toLowerCase() === "closed";
                  return (
                    <div
                      key={line.label}
                      className={`ms-forge-footer-hours-row${closed ? " ms-forge-footer-hours-row--closed" : ""}`}
                    >
                      <dt>{line.label}</dt>
                      <dd>{line.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>
        ) : null}

        {hasSocial ? (
          <section
            className="ms-forge-footer-col ms-forge-footer-col--social"
            aria-labelledby="forge-footer-social-heading"
          >
            <p className="ms-forge-footer-eyebrow">Social</p>
            <h2 id="forge-footer-social-heading" className="ms-forge-footer-heading">
              Folge uns
            </h2>
            <ForgeFooterSocial links={links} />
          </section>
        ) : null}
      </div>

      <div className="ms-forge-footer-bar">
        <div className="ms-forge-footer-bar-inner">
          <p className="ms-forge-footer-copy">
            © {year} {shop.name}
          </p>
          <nav className="ms-forge-footer-legal" aria-label="Rechtliches">
            <span>Kontakt</span>
            <span>Impressum</span>
            <span>Datenschutz</span>
          </nav>
        </div>
      </div>

      <Sheet open={phoneOpen} onOpenChange={setPhoneOpen}>
        <SheetContent className="ms-forge-contact-sheet" overlayClassName="ms-forge-contact-sheet-overlay">
          <SheetHeader>
            <SheetTitle className="text-[color:var(--ms-forge-cream)]">Jetzt anrufen?</SheetTitle>
          </SheetHeader>
          <p className="ms-forge-contact-sheet-detail">{phone}</p>
          <div className="flex flex-col gap-[var(--space-2)] pt-[var(--space-2)]">
            {telHref ? (
              <Button asChild className="w-full">
                <a href={telHref}>Anrufen</a>
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="w-full" onClick={() => setPhoneOpen(false)}>
              Abbrechen
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={mapOpen} onOpenChange={setMapOpen}>
        <SheetContent className="ms-forge-contact-sheet" overlayClassName="ms-forge-contact-sheet-overlay">
          <SheetHeader>
            <SheetTitle className="text-[color:var(--ms-forge-cream)]">Route öffnen?</SheetTitle>
          </SheetHeader>
          <p className="ms-forge-contact-sheet-detail">{address}</p>
          <div className="flex flex-col gap-[var(--space-2)] pt-[var(--space-2)]">
            {mapHref ? (
              <Button asChild className="w-full">
                <a href={mapHref} target="_blank" rel="noopener noreferrer">
                  In Google Maps öffnen
                </a>
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="w-full" onClick={() => setMapOpen(false)}>
              Abbrechen
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </footer>
  );
}
