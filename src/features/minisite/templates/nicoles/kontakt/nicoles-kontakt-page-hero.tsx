import { nicolesKontaktHeroImage } from "@/lib/minisite/nicoles-kontakt-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesKontaktPageHeroProps = {
  content: MinisiteContent;
};

export function NicolesKontaktPageHero({ content }: NicolesKontaktPageHeroProps) {
  const imagePath = nicolesKontaktHeroImage(content);

  return (
    <section
      className="ms-nicoles-kontakt-page-hero ms-nicoles-section ms-cinema-section relative overflow-hidden"
      aria-label="Kontakt Hero"
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9] sm:min-h-[min(28rem,50vh)]">
        <NicolesPhoto path={imagePath} priority sizes="100vw" />
      </div>
    </section>
  );
}
