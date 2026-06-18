import type { MinisiteTemplate } from "@/lib/validations/public-shop";

export type MinisiteAnchors = {
  top: string;
  about: string;
  services: string;
  prices: string;
  gallery: string;
  contact: string;
};

const ANCHORS: Record<MinisiteTemplate, MinisiteAnchors> = {
  classic: {
    top: "ms-minisite-top",
    about: "ms-minisite-about",
    services: "ms-minisite-services",
    prices: "ms-minisite-prices",
    gallery: "ms-minisite-gallery",
    contact: "ms-minisite-contact",
  },
  midnight: {
    top: "ms-minisite-top",
    about: "ms-minisite-about",
    services: "ms-minisite-services",
    prices: "ms-minisite-prices",
    gallery: "ms-minisite-gallery",
    contact: "ms-minisite-contact",
  },
  bold: {
    top: "ms-minisite-top",
    about: "ms-minisite-about",
    services: "ms-minisite-services",
    prices: "ms-minisite-prices",
    gallery: "ms-minisite-gallery",
    contact: "ms-minisite-contact",
  },
  signature: {
    top: "ms-signature-top",
    about: "ms-signature-about",
    services: "ms-signature-services",
    prices: "ms-signature-prices",
    gallery: "ms-signature-gallery",
    contact: "ms-signature-contact",
  },
  boutique: {
    top: "ms-boutique-top",
    about: "ms-boutique-about",
    services: "ms-boutique-services",
    prices: "ms-boutique-prices",
    gallery: "ms-boutique-gallery",
    contact: "ms-boutique-contact",
  },
  flux: {
    top: "ms-flux-top",
    about: "ms-flux-about",
    services: "ms-flux-services",
    prices: "ms-flux-prices",
    gallery: "ms-flux-gallery",
    contact: "ms-flux-contact",
  },
  nicoles: {
    top: "ms-nicoles-top",
    about: "ms-nicoles-about",
    services: "ms-nicoles-services",
    prices: "ms-nicoles-prices",
    gallery: "ms-nicoles-gallery",
    contact: "ms-nicoles-contact",
  },
};

export function getMinisiteAnchors(template: MinisiteTemplate): MinisiteAnchors {
  return ANCHORS[template];
}

export function defaultNavLinksForTemplate(template: MinisiteTemplate) {
  const a = getMinisiteAnchors(template);
  return [
    { id: "nav-home", label: "Home", href: `#${a.top}`, visible: true },
    { id: "nav-about", label: "Über uns", href: template === "nicoles" ? "/about" : `#${a.about}`, visible: true },
    {
      id: "nav-prices",
      label: "Leistungen & Preise",
      href: template === "nicoles" ? "/leistungen" : `#${a.prices}`,
      visible: true,
    },
    { id: "nav-book", label: "Terminbuchung", href: template === "nicoles" ? "/terminbuchung" : "__book__", visible: true },
    {
      id: "nav-contact",
      label: "Kontakt",
      href: template === "nicoles" ? "/kontakt" : `#${a.contact}`,
      visible: true,
    },
  ];
}
