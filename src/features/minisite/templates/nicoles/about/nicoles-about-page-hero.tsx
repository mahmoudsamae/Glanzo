import { resolveNicolesAboutHeroImage } from "@/lib/minisite/nicoles-stock-images";
import type { AboutBlock } from "@/lib/minisite/about-blocks";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesAboutPageHeroProps = {
  block?: AboutBlock;
  content: MinisiteContent;
};

export function NicolesAboutPageHero({ block, content }: NicolesAboutPageHeroProps) {
  const imagePath = resolveNicolesAboutHeroImage(content, block?.image_path);

  return (
    <section className="ms-nicoles-about-page-hero ms-nicoles-section ms-cinema-section relative overflow-hidden" aria-label="Über uns Hero">
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9] sm:min-h-[min(28rem,50vh)]">
        <NicolesPhoto path={imagePath} priority sizes="100vw" />
        <div className="ms-nicoles-about-page-hero-gradient absolute inset-0" aria-hidden />
      </div>
    </section>
  );
}
