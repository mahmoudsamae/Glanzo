import { resolveNicolesKontaktHeroImage } from "@/lib/minisite/nicoles-stock-images";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { formatOpeningHoursLines } from "@/server/modules/shops/opening-hours.format";

export const DEFAULT_KONTAKT_ADDRESS = "Prüfeninger Straße 109b, 93049 Regensburg";
export const DEFAULT_KONTAKT_PHONE = "+49 941 38 22 88 85";
export const DEFAULT_KONTAKT_EMAIL = "cut@nicoles-friseur-barber.de";

export const DEFAULT_KONTAKT_HOURS = ["Dienstag bis Freitag: 09–19 Uhr", "Samstag: 10–18 Uhr"];

export const DEFAULT_KONTAKT_MAP_DIRECTIONS =
  "Parkplätze direkt vor dem Salon. Anfahrt über A3 oder A93 — Ausfahrt Regensburg-Süd, dann Richtung Prüfening.";

export function nicolesKontaktHeroImage(content: ShopPublicData["minisite"]["content"]): string {
  return resolveNicolesKontaktHeroImage(content);
}

export function nicolesKontaktPageTitle(content: ShopPublicData["minisite"]["content"]): string {
  return content.sections?.contact?.title?.trim() || "Kontakt";
}

export function resolveKontaktAddress(content: ShopPublicData["minisite"]["content"]): string {
  return content.address?.trim() || DEFAULT_KONTAKT_ADDRESS;
}

export function resolveKontaktPhone(content: ShopPublicData["minisite"]["content"]): string {
  return content.phone?.trim() || DEFAULT_KONTAKT_PHONE;
}

export function resolveKontaktEmail(content: ShopPublicData["minisite"]["content"]): string {
  return content.email?.trim() || DEFAULT_KONTAKT_EMAIL;
}

export function resolveKontaktHours(data: ShopPublicData): string[] {
  const custom = data.minisite.content.sections?.contact?.subtitle?.trim();
  if (custom) {
    return custom
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const lines = formatOpeningHoursLines(data.shop.opening_hours);
  if (lines.length === 0) {
    return DEFAULT_KONTAKT_HOURS;
  }

  const openLines = lines.filter((line) => line.value !== "Closed");
  if (openLines.length === 0) {
    return DEFAULT_KONTAKT_HOURS;
  }

  return openLines.map((line) => `${line.label}: ${line.value}`);
}

export function resolveKontaktMapDirections(content: ShopPublicData["minisite"]["content"]): string {
  return content.sections?.contact?.text?.trim() || content.visitor_guidelines?.trim() || DEFAULT_KONTAKT_MAP_DIRECTIONS;
}

export function resolveGoogleMapsHref(
  content: ShopPublicData["minisite"]["content"],
  address: string,
): string {
  const custom = content.links?.google_maps?.trim();
  if (custom) {
    return custom;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
