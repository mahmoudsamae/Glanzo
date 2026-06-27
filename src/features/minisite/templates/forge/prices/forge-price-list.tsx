import {
  forgeCatalogPriceTitle,
  resolveForgeExtraPriceSections,
  servicesToForgePriceRows,
} from "@/lib/minisite/forge-prices-page";
import { resolveForgePriceListBackground } from "@/lib/minisite/forge-media";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../../nicoles/nicoles-media";

type ForgePriceListProps = {
  content: MinisiteContent;
  services: ShopPublicData["services"];
};

type PriceGroupProps = {
  title: string;
  rows: Array<{ id?: string; label: string; price: string }>;
  revealDelay: number;
};

function ForgePriceGroup({ title, rows, revealDelay }: PriceGroupProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div {...forgeReveal("up", revealDelay)} className="ms-forge-price-group">
      <h2 className="ms-forge-price-group-title">{title}</h2>
      <ul className="ms-forge-price-rows">
        {rows.map((row) => (
          <li key={row.id ?? `${title}-${row.label}`} className="ms-forge-price-row">
            <span className="ms-forge-price-row-label">{row.label}</span>
            <span className="ms-forge-price-row-leader" aria-hidden />
            <span className="ms-forge-price-row-price tabular-nums">{row.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ForgePriceList({ content, services }: ForgePriceListProps) {
  const backgroundPath = resolveForgePriceListBackground(content);
  const extraSections = resolveForgeExtraPriceSections(content).filter((section) => section.title.trim());
  const catalogRows = servicesToForgePriceRows(services);
  const catalogTitle = forgeCatalogPriceTitle(content);

  const hasExtras = extraSections.some((section) => (section.rows?.length ?? 0) > 0);
  const hasCatalog = catalogRows.length > 0;

  if (!hasExtras && !hasCatalog) {
    return null;
  }

  const extraGroups = extraSections
    .filter((section) => section.title.trim())
    .map((section, index) => ({
      section,
      revealDelay: index * 90,
    }));
  const catalogRevealDelay = extraGroups.length * 90;

  return (
    <section
      id="ms-forge-prices"
      className="ms-forge-price-list ms-forge-section ms-cinema-section"
      aria-label="Preisliste"
    >
      {backgroundPath ? (
        <>
          <div className="ms-forge-price-list-bg" aria-hidden>
            <NicolesPhoto path={backgroundPath} sizes="100vw" color />
          </div>
          <div className="ms-forge-price-list-bg-overlay" aria-hidden />
        </>
      ) : null}

      <div className="ms-forge-price-list-inner">
        {extraGroups.map(({ section, revealDelay }) => (
          <ForgePriceGroup
            key={section.id}
            title={section.title}
            rows={section.rows ?? []}
            revealDelay={revealDelay}
          />
        ))}

        {hasCatalog ? (
          <ForgePriceGroup title={catalogTitle} rows={catalogRows} revealDelay={catalogRevealDelay} />
        ) : null}
      </div>
    </section>
  );
}
