import { forgeReveal } from "@/lib/minisite/forge-motion";

type ForgePricesPageTitleProps = {
  title?: string;
};

export function ForgePricesPageTitle({ title = "Leistungen & Preise" }: ForgePricesPageTitleProps) {
  return (
    <header className="ms-forge-prices-title ms-forge-section ms-cinema-section" aria-label="Seitentitel">
      <div {...forgeReveal("up", 0)} className="ms-forge-prices-title-inner">
        <span className="ms-forge-prices-title-mark" aria-hidden>
          ◆
        </span>
        <h1 className="ms-forge-prices-title-text">{title}</h1>
      </div>
    </header>
  );
}
