import { getNicolesSectionField, NICOLES_SECTION_META } from "@/lib/minisite/nicoles-sections";
import { resolveNicolesSalonBannerImage } from "@/lib/minisite/nicoles-stock-images";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesSalonBannerProps = {
  data: ShopPublicData;
};

export function NicolesSalonBanner({ data }: NicolesSalonBannerProps) {
  const content = data.minisite.content;
  const meta = NICOLES_SECTION_META.salon_banner;
  const imagePath = resolveNicolesSalonBannerImage(content);

  return (
    <section
      className="ms-nicoles-salon-banner ms-nicoles-section ms-cinema-section relative min-h-[min(28rem,70vw)] overflow-hidden"
      aria-label="Salon"
    >
      <div className="absolute inset-0">
        <NicolesPhoto path={imagePath} color sizes="100vw" />
      </div>
      <div className="ms-nicoles-salon-banner-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 flex min-h-[min(28rem,70vw)] items-center justify-center px-[var(--space-4)] py-[var(--space-12)] text-center">
        <p className="ms-nicoles-display max-w-3xl font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.2] text-white">
          {getNicolesSectionField(content, "salon_banner", "title", meta.defaults.title ?? "")}
        </p>
      </div>
    </section>
  );
}
