import type { ShopPublicData } from "@/lib/validations/public-shop";

import { MinisiteCinema } from "../components/minisite-cinema.client";
import { BookBarSection } from "../sections/book-bar";
import { GallerySection } from "../sections/gallery";
import { HeroSection } from "../sections/hero";
import { LocationHoursSection } from "../sections/location-hours";
import { PriceBoardSection } from "../sections/price-board";
import { TeamSection } from "../sections/team";

type MinisiteShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  /** Editor preview — no booking chrome. */
  preview?: boolean;
};

export function MinisiteShell({ data, shopSlug, preview = false }: MinisiteShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";

  return (
    <>
      {preview ? null : <MinisiteCinema />}
      <main
        className={`mx-auto flex w-full max-w-2xl flex-1 flex-col ${
          preview ? "pb-[var(--space-4)]" : "pb-[calc(var(--space-16)+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]"
        }`}
      >
        <HeroSection data={data} bookHref={bookHref} preview={preview} />
        <PriceBoardSection services={data.services} />
        <TeamSection data={data} bookHrefBase={bookHref} preview={preview} />
        <GallerySection content={data.minisite.content} />
        <LocationHoursSection data={data} />
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} />}
    </>
  );
}
