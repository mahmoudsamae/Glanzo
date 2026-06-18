import { nicolesPricesPageTitle } from "@/lib/minisite/nicoles-prices-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPriceList } from "./nicoles-price-list";
import { NicolesPricesPageHero } from "./nicoles-prices-page-hero";
import { NicolesPricesPageTitle } from "./nicoles-prices-page-title";
import { NicolesServicesGrid } from "./nicoles-services-grid";

type NicolesPricesPageProps = {
  data: ShopPublicData;
};

export function NicolesPricesPage({ data }: NicolesPricesPageProps) {
  const content = data.minisite.content;

  if (content.show?.prices === false) {
    return null;
  }

  return (
    <article aria-label="Leistungen und Preise">
      <NicolesPricesPageHero content={content} />
      <NicolesPricesPageTitle title={nicolesPricesPageTitle(content)} />
      <NicolesServicesGrid content={content} />
      <NicolesPriceList content={content} />
    </article>
  );
}
