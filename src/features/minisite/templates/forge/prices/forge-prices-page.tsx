import { forgeFooterContactHash } from "@/lib/minisite/forge-section-scroll";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { ForgeScrollCue } from "../forge-scroll-cue";
import { ForgeServiceCard } from "../sections/forge-service-card";

import { ForgePriceList } from "./forge-price-list";
import { ForgePricesPageHero } from "./forge-prices-page-hero";

type ForgePricesPageProps = {
  data: ShopPublicData;
};

export function ForgePricesPage({ data }: ForgePricesPageProps) {
  const content = data.minisite.content;

  if (content.show?.prices === false) {
    return null;
  }

  const services = data.services;
  const suspended = data.shop.status === "suspended";

  return (
    <article aria-label="Leistungen und Preise">
      <ForgePricesPageHero content={content} />

      {services.length > 0 ? (
        <section
          id="ms-forge-prices-catalog"
          className="ms-forge-section-stack ms-forge-services-grid ms-forge-section ms-cinema-section"
          aria-label="Leistungen Übersicht"
        >
          <ul data-forge-stagger>
            {services.map((service, index) => (
              <li key={service.id} {...forgeReveal("up", index * 70)}>
                <ForgeServiceCard
                  service={service}
                  shopSlug={data.shop.slug}
                  suspended={suspended}
                  page
                />
              </li>
            ))}
          </ul>
          <ForgeScrollCue href="#ms-forge-prices" className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end" />
        </section>
      ) : null}

      <div className="ms-forge-section-stack">
        <ForgePriceList content={content} services={services} />
        <ForgeScrollCue
          href={forgeFooterContactHash()}
          className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end"
        />
      </div>
    </article>
  );
}
