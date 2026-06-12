import Image from "next/image";

import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../lib/media-url";

type GalleryProps = {
  content: MinisiteContent;
};

export function GallerySection({ content }: GalleryProps) {
  if (content.show?.gallery === false) {
    return null;
  }

  const paths = content.gallery?.filter(Boolean) ?? [];
  if (paths.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Galerie"
      className="ms-cinema-section px-[var(--space-4)] py-[var(--space-8)]"
    >
      <div className="mx-auto w-full max-w-lg">
        <h2 className="mb-[var(--space-4)] text-center font-display text-xl text-[color:var(--ms-text)]">
          Galerie
        </h2>
        <ul className="ms-cinema-gallery ms-cinema-cascade">
          {paths.map((path, index) => {
            const url = shopMediaPublicUrl(path);
            if (!url) return null;
            return (
              <li
                key={path}
                className="ms-cinema-gallery-item relative aspect-[4/5] overflow-hidden rounded-sm"
                style={{ ["--cascade-i" as string]: index }}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 160px"
                  className="object-cover"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
