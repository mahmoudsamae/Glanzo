import { nicolesTerminHeroImage } from "@/lib/minisite/nicoles-terminbuchung-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesTerminbuchungPageHeroProps = {
  content: MinisiteContent;
};

export function NicolesTerminbuchungPageHero({ content }: NicolesTerminbuchungPageHeroProps) {
  const imagePath = nicolesTerminHeroImage(content);

  return (
    <section
      className="ms-nicoles-termin-page-hero ms-nicoles-section ms-cinema-section relative overflow-hidden"
      aria-label="Terminbuchung Hero"
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9] sm:min-h-[min(28rem,50vh)]">
        <NicolesPhoto path={imagePath} priority sizes="100vw" />
      </div>
    </section>
  );
}
