import Image from "next/image";

import { galleryPath } from "@/lib/minisite/nicoles-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { minisiteImageUrl } from "../../../lib/media-url";
import { NicolesPhoto } from "../nicoles-media";
import { NicolesLogoIcon } from "../nicoles-logo-icon";

type NicolesPreFooterProps = {
  data: ShopPublicData;
};

export function NicolesPreFooter({ data }: NicolesPreFooterProps) {
  const content = data.minisite.content;
  const blockPaths = content.sections?.pre_footer?.image_paths ?? [];
  const leftPath = blockPaths[0] ?? galleryPath(content, 1);
  const rightPath = blockPaths[1] ?? galleryPath(content, 2);
  const logoUrl = content.logo_path ? minisiteImageUrl(content.logo_path) : null;

  return (
    <section
      className="ms-nicoles-pre-footer ms-nicoles-section ms-cinema-section grid grid-cols-1 lg:grid-cols-3"
      aria-label="Markenabschluss"
    >
      <div className="relative min-h-[14rem] bg-[color:var(--ms-border-subtle)]">
        <NicolesPhoto path={leftPath} sizes="33vw" />
      </div>

      <div className="flex min-h-[14rem] items-center justify-center bg-[color:var(--ms-nicoles-teal)] px-[var(--space-6)] py-[var(--space-10)]">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={160}
            height={160}
            className="size-28 rounded-full border-2 border-[color:var(--ms-accent)] object-cover"
          />
        ) : (
          <div className="text-center text-white">
            <NicolesLogoIcon className="mx-auto size-16" />
            <p className="mt-[var(--space-3)] font-display text-xl uppercase tracking-[0.2em]">
              {data.shop.name}
            </p>
          </div>
        )}
      </div>

      <div className="relative min-h-[14rem] bg-[color:var(--ms-border-subtle)]">
        <NicolesPhoto path={rightPath} sizes="33vw" />
      </div>
    </section>
  );
}
