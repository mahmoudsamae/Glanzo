import Image from "next/image";

import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";

import { SignatureSectionShell } from "../signature-section-shell";

type SignatureGalleryShowcaseProps = {
  content: MinisiteContent;
};

export function SignatureGalleryShowcase({ content }: SignatureGalleryShowcaseProps) {
  if (content.show?.gallery === false) {
    return null;
  }

  const paths = content.gallery?.filter(Boolean) ?? [];
  if (paths.length === 0) {
    return null;
  }

  const [heroPath, ...restPaths] = paths;

  return (
    <section
      aria-label="Galerie"
      className="ms-signature-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <SignatureSectionShell>
        <header className="mb-[var(--space-4)] text-center">
          <p className="ms-signature-eyebrow">Galerie</p>
          <h2 className="font-display text-2xl text-[color:var(--ms-text)]">Impressionen</h2>
        </header>
        {heroPath ? (
          <figure className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={shopMediaPublicUrl(heroPath)!}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </figure>
        ) : null}
        {restPaths.length > 0 ? (
          <ul className="mt-[var(--space-3)] grid grid-cols-2 gap-[var(--space-2)]">
            {restPaths.map((path) => {
              const url = shopMediaPublicUrl(path);
              if (!url) return null;
              return (
                <li key={path} className="relative aspect-square overflow-hidden rounded-md">
                  <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                </li>
              );
            })}
          </ul>
        ) : null}
      </SignatureSectionShell>
    </section>
  );
}
