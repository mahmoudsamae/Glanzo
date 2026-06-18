import { resolveNicolesTerminHeroImage } from "@/lib/minisite/nicoles-stock-images";
import { normalizeWhatsAppUrl, resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { instagramProfileUrl } from "@/lib/minisite/instagram-url";

export type NicolesBookingOptionKind = "phone" | "whatsapp" | "instagram" | "mail";

export type NicolesBookingOption = {
  id: string;
  kind: NicolesBookingOptionKind;
  title: string;
  description: string;
  contactLabel: string;
  href?: string;
};

export const DEFAULT_NICOLES_BOOKING_INTRO =
  "Wähle einfach deinen Weg – ob telefonisch, per WhatsApp, Instagram oder E-Mail. Wir melden uns so schnell wie möglich und bestätigen deinen Termin asap.";

const DEFAULT_BOOKING_OPTIONS: NicolesBookingOption[] = [
  {
    id: "book-phone",
    kind: "phone",
    title: "Telefon",
    description: "Ruf einfach kurz durch – wir beraten dich gerne persönlich und finden gemeinsam den passenden Termin.",
    contactLabel: "Tel +49 941 38 22 88 85",
  },
  {
    id: "book-whatsapp",
    kind: "whatsapp",
    title: "WhatsApp",
    description: "Schreib uns einfach direkt – wir melden uns schnell zurück!",
    contactLabel: "+49 941 38 22 88 85",
  },
  {
    id: "book-instagram",
    kind: "instagram",
    title: "Instagram",
    description: "Folge uns für Inspiration & schreib uns direkt eine Nachricht für deinen Wunschtermin.",
    contactLabel: "@nicoles_friseur_barber",
  },
  {
    id: "book-mail",
    kind: "mail",
    title: "Mail",
    description: "Schreib uns per Mail – teile uns deinen Wunschtermin und deine Fragen mit.",
    contactLabel: "cut@nicoles-friseur-barber.de",
  },
];

export function nicolesTerminHeroImage(content: MinisiteContent): string {
  return resolveNicolesTerminHeroImage(content);
}

export function nicolesTerminPageTitle(content: MinisiteContent): string {
  return content.sections?.booking?.title?.trim() || "Terminbuchung";
}

export function nicolesTerminIntro(content: MinisiteContent): string {
  return content.sections?.booking?.text?.trim() || DEFAULT_NICOLES_BOOKING_INTRO;
}

export function resolveNicolesBookingOptions(content: MinisiteContent): NicolesBookingOption[] {
  const phone = content.phone?.trim() || "+49 941 38 22 88 85";
  const email = content.email?.trim() || "cut@nicoles-friseur-barber.de";
  const links = resolveMinisiteLinks(content.links, content.instagram);
  const whatsappRaw = links?.whatsapp?.trim() || phone;
  const whatsappHref = normalizeWhatsAppUrl(whatsappRaw);
  const instagramRaw = links?.instagram?.trim() || "@nicoles_friseur_barber";
  const instagramHandle = instagramRaw.replace(/^@/, "");
  const instagramLabel = instagramRaw.startsWith("@") ? instagramRaw : `@${instagramHandle}`;
  const instagramHref = instagramProfileUrl(instagramRaw);

  return DEFAULT_BOOKING_OPTIONS.map((option) => {
    switch (option.kind) {
      case "phone":
        return {
          ...option,
          contactLabel: `Tel ${phone}`,
          href: `tel:${phone.replace(/\s/g, "")}`,
        };
      case "whatsapp":
        return {
          ...option,
          contactLabel: phone,
          href: whatsappHref,
        };
      case "instagram":
        return {
          ...option,
          contactLabel: instagramLabel,
          href: instagramHref,
        };
      case "mail":
        return {
          ...option,
          contactLabel: email,
          href: `mailto:${email}`,
        };
      default:
        return option;
    }
  });
}
