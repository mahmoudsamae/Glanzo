import Image from "next/image";
import Link from "next/link";

import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";
import { VelvetAnchorLink } from "./velvet-anchor-link.client";

type VelvetFooterProps = {
  data: ShopPublicData;
  shopSlug: string;
  i18n: VelvetI18n;
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-3.5">
      <rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="5.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-3.5">
      <path
        d="M10 2.5a7.5 7.5 0 0 1 6.5 11.25L17.5 17.5l-3.75-1a7.5 7.5 0 1 1-3.75-14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function extractInstagramHandle(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("instagram.com")) {
      const handle = url.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
      return handle ? `@${handle}` : "";
    }
  } catch { /* not a URL */ }
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function VelvetFooter({ data, shopSlug, i18n }: VelvetFooterProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("velvet");

  const instagram = content.links?.instagram || content.instagram;
  const whatsapp = content.links?.whatsapp;
  const phone = content.phone;
  const email = content.email;
  const address = content.address;

  const year = new Date().getFullYear();
  const logoUrl = content.logo_path?.trim() ? shopMediaPublicUrl(content.logo_path.trim()) : null;

  return (
    <footer className="ms-velvet-footer">
      <div className="ms-velvet-footer-inner">
        <div className="ms-velvet-footer-grid">
          {/* Brand column */}
          <div>
            {logoUrl ? (
              <div className="ms-velvet-footer-logo">
                <Image src={logoUrl} alt="" width={180} height={72} className="ms-velvet-footer-logo-img" />
              </div>
            ) : null}
            <p className="ms-velvet-footer-brand">{shop.name}</p>
            <p className="ms-velvet-footer-tagline">
              {content.about?.trim()
                ? content.about.slice(0, 100)
                : i18n.footer.tagline}
            </p>

            {(instagram || whatsapp) ? (
              <ul className="ms-velvet-footer-socials">
                {instagram ? (
                  <li>
                    <a
                      href={`https://instagram.com/${extractInstagramHandle(instagram).replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-velvet-footer-social-pill"
                    >
                      <InstagramIcon />
                      {extractInstagramHandle(instagram)}
                    </a>
                  </li>
                ) : null}
                {whatsapp ? (
                  <li>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-velvet-footer-social-pill"
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          {/* Navigation column */}
          <div>
            <p className="ms-velvet-footer-heading">{i18n.footer.navHeading}</p>
            <VelvetAnchorLink href={`#${anchors.top}`} className="ms-velvet-footer-link">
              {i18n.footer.links.home}
            </VelvetAnchorLink>
            <VelvetAnchorLink href={`#${anchors.about}`} className="ms-velvet-footer-link">
              {i18n.footer.links.about}
            </VelvetAnchorLink>
            <VelvetAnchorLink href={`#${anchors.services}`} className="ms-velvet-footer-link">
              {i18n.footer.links.services}
            </VelvetAnchorLink>
            <VelvetAnchorLink href={`#${anchors.gallery}`} className="ms-velvet-footer-link">
              {i18n.footer.links.gallery}
            </VelvetAnchorLink>
            <VelvetAnchorLink href={`#${anchors.contact}`} className="ms-velvet-footer-link">
              {i18n.footer.links.contact}
            </VelvetAnchorLink>
          </div>

          {/* Contact column */}
          <div>
            <p className="ms-velvet-footer-heading">{i18n.footer.contactHeading}</p>
            {address ? <p className="ms-velvet-footer-link" style={{ cursor: "default" }}>{address}</p> : null}
            {phone ? (
              <a href={`tel:${phone}`} className="ms-velvet-footer-link">{phone}</a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="ms-velvet-footer-link">{email}</a>
            ) : null}
          </div>
        </div>

        <div className="ms-velvet-footer-bottom">
          <span>© {year} {shop.name}. {i18n.footer.rights}</span>
          <span>Powered by BarbarOS</span>
        </div>
      </div>
    </footer>
  );
}
