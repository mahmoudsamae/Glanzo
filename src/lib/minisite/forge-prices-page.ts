import { formatPriceCents } from "@/lib/minisite/format-price";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

type PriceSection = NonNullable<MinisiteContent["nicoles_price_sections"]>[number];
type PriceRow = NonNullable<PriceSection["rows"]>[number];

/** Manual price categories only — no static salon defaults on Forge. */
export function resolveForgeExtraPriceSections(content: MinisiteContent): PriceSection[] {
  return content.nicoles_price_sections ?? [];
}

export function forgeCatalogPriceTitle(content: MinisiteContent): string {
  return content.sections?.prices?.eyebrow?.trim() || "LEISTUNGEN";
}

export function servicesToForgePriceRows(
  services: ShopPublicData["services"],
): PriceRow[] {
  return services.map((service) => ({
    id: `svc-${service.id}`,
    label: service.name,
    price: service.show_price !== false ? formatPriceCents(service.price_cents) : "—",
  }));
}

export function createForgePriceSection(title = "NEUE KATEGORIE"): PriceSection {
  return {
    id: `price-${crypto.randomUUID().slice(0, 8)}`,
    title,
    rows: [],
  };
}
