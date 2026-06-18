import { nicolesPricesHeroImage } from "@/lib/minisite/nicoles-prices-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesPricesPageHeroProps = {
  content: MinisiteContent;
};

export function NicolesPricesPageHero({ content }: NicolesPricesPageHeroProps) {
  const imagePath = nicolesPricesHeroImage(content);

  return (
    <section className="ms-nicoles-prices-page-hero ms-nicoles-section ms-cinema-section relative overflow-hidden" aria-label="Leistungen Hero">
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9] sm:min-h-[min(28rem,50vh)]">
        <NicolesPhoto path={imagePath} priority sizes="100vw" />
      </div>
    </section>
  );
}
