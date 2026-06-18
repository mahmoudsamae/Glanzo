import Image from "next/image";

import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

type FluxGalleryStripProps = {
  content: MinisiteContent;
};

export function FluxGalleryStrip({ content }: FluxGalleryStripProps) {
  if (content.show?.gallery === false) {
    return null;
  }

  const paths = content.gallery?.filter(Boolean) ?? [];
  if (paths.length === 0) {
    return null;
  }

  return (
    <section aria-label="Galerie" className="ms-flux-section py-[var(--space-8)]">
      <div className="mb-[var(--space-4)] px-[var(--space-4)]">
        <p className="ms-flux-kicker">Galerie</p>
        <h2 className="font-display text-2xl uppercase tracking-tight text-[color:var(--ms-text)]">
          Looks
        </h2>
      </div>

      <div className="ms-flux-gallery-strip flex gap-[var(--space-2)] overflow-x-auto overscroll-x-contain px-[var(--space-4)] pb-[var(--space-2)]">
        {paths.map((path, index) => {
          const url = shopMediaPublicUrl(path);
          if (!url) return null;
          const tall = index % 2 === 0;
          return (
            <figure
              key={path}
              className={`ms-flux-gallery-frame shrink-0 snap-start ${tall ? "ms-flux-gallery-frame--tall" : ""}`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 70vw, 240px"
                className="object-cover"
              />
            </figure>
          );
        })}
      </div>
    </section>
  );
}
