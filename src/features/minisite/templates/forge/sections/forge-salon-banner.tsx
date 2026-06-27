import Image from "next/image";

import { resolveForgeSalonBannerImage } from "@/lib/minisite/forge-media";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import { getForgeSectionField, FORGE_SECTION_META } from "@/lib/minisite/forge-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { minisiteImageUrl } from "../../../lib/media-url";
import { NicolesPhoto } from "../../nicoles/nicoles-media";
import { ForgeLogoIcon } from "../forge-logo-icon";

type ForgeSalonBannerProps = {
  data: ShopPublicData;
};

export function ForgeSalonBanner({ data }: ForgeSalonBannerProps) {
  const content = data.minisite.content;
  const meta = FORGE_SECTION_META.salon_banner;
  const imagePath = resolveForgeSalonBannerImage(content);
  const logoPath = content.logo_path?.trim();
  const title = getForgeSectionField(content, "salon_banner", "title", meta.defaults.title ?? "");

  return (
    <section
      id="ms-forge-salon-banner"
      className="ms-forge-salon-banner ms-forge-section ms-cinema-section"
      aria-label="Salon"
    >
      <div className="ms-forge-salon-banner-media">
        {imagePath ? (
          <NicolesPhoto path={imagePath} color sizes="100vw" className="ms-forge-salon-banner-image" />
        ) : (
          <div className="ms-forge-salon-banner-fallback" aria-hidden />
        )}
        <div className="ms-forge-salon-banner-overlay" aria-hidden />
      </div>

      <div className="ms-forge-salon-banner-content">
        <div {...forgeReveal("fade", 0)} className="ms-forge-salon-banner-mark">
          {logoPath ? (
            <Image
              src={minisiteImageUrl(logoPath)}
              alt=""
              width={72}
              height={72}
              className="ms-forge-salon-banner-logo"
            />
          ) : (
            <ForgeLogoIcon className="size-14 text-[color:var(--ms-forge-copper)]" />
          )}
        </div>
        <p {...forgeReveal("up", 120)} className="ms-forge-salon-banner-title">
          {title}
        </p>
      </div>
    </section>
  );
}
