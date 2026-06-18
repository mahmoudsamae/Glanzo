import type { MinisiteContent } from "@/lib/validations/public-shop";

import { resolveNicolesPricesHeroImage, resolveNicolesServiceCardImage } from "./nicoles-stock-images";

export const DEFAULT_NICOLES_SERVICE_CARDS: NonNullable<MinisiteContent["nicoles_service_cards"]> = [
  { id: "svc-damen", title: "Damen – Haarschnitte und Styling" },
  { id: "svc-color", title: "Color & Highlights" },
  { id: "svc-event", title: "Event- & Occasion-Styling" },
  { id: "svc-barber", title: "Barber" },
  { id: "svc-tools", title: "Barber Tools" },
  { id: "svc-kinder", title: "Kinder" },
];

export const DEFAULT_NICOLES_PRICE_SECTIONS: NonNullable<MinisiteContent["nicoles_price_sections"]> = [
  { id: "price-beauty", title: "BEAUTY & PFLEGE", rows: [] },
  {
    id: "price-kinder",
    title: "KINDER",
    rows: [
      { id: "k-1", label: "0–3 Jahre", price: "10 €" },
      { id: "k-2", label: "3–12 Jahre", price: "20 €" },
    ],
  },
  {
    id: "price-teenie",
    title: "TEENIE",
    rows: [
      { id: "t-1", label: "Mädchen 13–18", price: "ab 35 €" },
      { id: "t-2", label: "Teenie Junge", price: "25 €" },
    ],
  },
  {
    id: "price-damen",
    title: "DAMEN",
    rows: [
      { id: "d-1", label: "Waschen / Schneiden / Föhnen kurz", price: "45 €" },
      { id: "d-2", label: "Waschen / Schneiden / Föhnen mittel", price: "50 €" },
      { id: "d-3", label: "Waschen / Schneiden / Föhnen lang", price: "55 €" },
      { id: "d-4", label: "Waschen / Föhnen kurz", price: "30 €" },
      { id: "d-5", label: "Waschen / Föhnen mittel", price: "35 €" },
      { id: "d-6", label: "Waschen / Föhnen lang", price: "40 €" },
      { id: "d-7", label: "Farbe Ansatz", price: "45 €" },
      { id: "d-8", label: "Foliensträhnen", price: "ab 66 €" },
      { id: "d-9", label: "Balayage", price: "290 €" },
    ],
  },
  { id: "price-herren", title: "HERREN", rows: [] },
  { id: "price-barber", title: "BARBER", rows: [] },
];

export function resolveNicolesServiceCards(content: MinisiteContent) {
  if (content.nicoles_service_cards?.length) {
    return content.nicoles_service_cards;
  }
  return DEFAULT_NICOLES_SERVICE_CARDS;
}

export function resolveNicolesPriceSections(content: MinisiteContent) {
  if (content.nicoles_price_sections?.length) {
    return content.nicoles_price_sections;
  }
  return DEFAULT_NICOLES_PRICE_SECTIONS;
}

export function nicolesPricesHeroImage(content: MinisiteContent): string {
  return resolveNicolesPricesHeroImage(content);
}

export function nicolesPricesPageTitle(content: MinisiteContent): string {
  return content.sections?.prices?.title?.trim() || "Leistungen & Preise";
}

/** Parse price rows: "Label|Price" per line. */
export function parsePriceRows(text: string): Array<{ label: string; price: string }> {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf("|");
      if (pipe === -1) {
        return { label: line, price: "" };
      }
      return {
        label: line.slice(0, pipe).trim(),
        price: line.slice(pipe + 1).trim(),
      };
    })
    .filter((row) => row.label && row.price);
}

export function formatPriceRows(rows: Array<{ label: string; price: string }>): string {
  return rows.map((row) => `${row.label}|${row.price}`).join("\n");
}

export function serviceCardImage(content: MinisiteContent, index: number, imagePath?: string): string {
  return resolveNicolesServiceCardImage(content, index, imagePath);
}
