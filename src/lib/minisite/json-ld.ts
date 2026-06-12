import type { OpeningHours, WeekdayKey } from "@/lib/validations/shop";
import { WEEKDAY_ORDER } from "@/lib/validations/shop";
import type { ShopPublicData } from "@/lib/validations/public-shop";
import { linksToSameAs, resolveMinisiteLinks } from "@/lib/validations/minisite-links";

const SCHEMA_DAYS: Record<WeekdayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function openingHoursSpecification(hours: OpeningHours) {
  const specs: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string;
    opens: string;
    closes: string;
  }> = [];

  for (const day of WEEKDAY_ORDER) {
    const slot = hours[day];
    if (!slot) {
      continue;
    }
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[day],
      opens: slot.open,
      closes: slot.close,
    });
  }

  return specs;
}

export function buildShopJsonLd(data: ShopPublicData, siteOrigin: string) {
  const url = `${siteOrigin.replace(/\/$/, "")}/s/${data.shop.slug}`;
  const address = data.minisite.content.address?.trim();
  const sameAs = linksToSameAs(
    resolveMinisiteLinks(data.minisite.content.links, data.minisite.content.instagram),
  );

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: data.shop.name,
    url,
    ...(address ? { address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    openingHoursSpecification: openingHoursSpecification(data.shop.opening_hours),
  };
}

export function shopJsonLdScript(data: ShopPublicData, siteOrigin: string): string {
  return JSON.stringify(buildShopJsonLd(data, siteOrigin));
}
