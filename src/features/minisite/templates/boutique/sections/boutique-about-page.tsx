import type { ShopPublicData } from "@/lib/validations/public-shop";

import { resolveAboutBlocks } from "@/lib/minisite/about-blocks";

import { BoutiqueAboutBlock } from "./boutique-about-block";

type BoutiqueAboutPageProps = {
  data: ShopPublicData;
  bookHref: string;
  preview?: boolean;
  sectionId?: string;
};

export function BoutiqueAboutPage({ data, bookHref, preview = false, sectionId = "ms-boutique-about" }: BoutiqueAboutPageProps) {
  const content = data.minisite.content;

  if (content.show?.about === false) {
    return null;
  }

  const blocks = resolveAboutBlocks(content);
  if (blocks.length === 0) {
    return null;
  }

  const isSuspended = data.shop.status === "suspended";

  return (
    <section
      id={sectionId}
      aria-label="Über uns"
      className="ms-boutique-about-page ms-boutique-section ms-cinema-section"
    >
      {blocks.map((block) => (
        <BoutiqueAboutBlock
          key={block.id}
          block={block}
          content={content}
          shopName={data.shop.name}
          bookHref={bookHref}
          preview={preview}
          suspended={isSuspended}
        />
      ))}
    </section>
  );
}
