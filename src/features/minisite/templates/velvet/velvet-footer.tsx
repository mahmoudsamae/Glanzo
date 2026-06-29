import Link from "next/link";

import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { ShopPublicData } from "@/lib/validations/public-shop";

type VelvetFooterProps = {
  data: ShopPublicData;
  shopSlug: string;
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

export function VelvetFooter({ data, shopSlug }: VelvetFooterProps) {
  const { shop, minisite } = data;
  const content = minisite.content;
  const anchors = getMinisiteAnchors("velvet");

  const instagram = content.links?.instagram || content.instagram;
  const whatsapp = content.links?.whatsapp;
  const phone = content.phone;
  const email = content.email;
  const address = content.address;

  const year = new Date().getFullYear();

  return (
    <footer className="ms-velvet-footer">
      <div className="ms-velvet-footer-inner">
        <div className="ms-velvet-footer-grid">
          {/* Brand column */}
          <div>
            <p className="ms-velvet-footer-brand">{shop.name}</p>
            <p className="ms-velvet-footer-tagline">
              {content.about?.trim()
                ? content.about.slice(0, 100)
                : "Handcrafted nail art. Every set is a work of art."}
            </p>

            {(instagram || whatsapp) ? (
              <ul className="ms-velvet-footer-socials">
                {instagram ? (
                  <li>
                    <a
                      href={`https://instagram.com/${instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-velvet-footer-social-pill"
                    >
                      <InstagramIcon />
                      {instagram.startsWith("@") ? instagram : `@${instagram}`}
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
            <p className="ms-velvet-footer-heading">Navigation</p>
            <a href={`#${anchors.top}`} className="ms-velvet-footer-link">Home</a>
            <a href={`#${anchors.about}`} className="ms-velvet-footer-link">About</a>
            <a href={`#${anchors.services}`} className="ms-velvet-footer-link">Services</a>
            <a href={`#${anchors.gallery}`} className="ms-velvet-footer-link">Gallery</a>
            <a href={`#${anchors.contact}`} className="ms-velvet-footer-link">Contact</a>
          </div>

          {/* Contact column */}
          <div>
            <p className="ms-velvet-footer-heading">Contact</p>
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
          <span>© {year} {shop.name}. All rights reserved.</span>
          <span>Powered by BarbarOS</span>
        </div>
      </div>
    </footer>
  );
}
