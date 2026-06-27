import type { ReactNode } from "react";

import type { ShopPublicData } from "@/lib/validations/public-shop";

import { BookBarSection } from "../../sections/book-bar";
import { ForgeFooter } from "./forge-footer.client";
import { NicolesNav } from "../nicoles/nicoles-nav.client";
import { ForgeAmbient } from "./forge-ambient.client";

type ForgeSubpageChromeProps = {
  data: ShopPublicData;
  shopSlug: string;
  children: ReactNode;
};

/** Shared layout for Forge sub-routes (/about, /leistungen, …). */
export function ForgeSubpageChrome({ data, shopSlug, children }: ForgeSubpageChromeProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const basePath = `/s/${shopSlug}`;
  const isSuspended = data.shop.status === "suspended";

  return (
    <div className="ms-forge-root relative flex min-h-full flex-1 flex-col">
      <ForgeAmbient />
      <NicolesNav
        shopName={data.shop.name}
        content={data.minisite.content}
        bookHref={bookHref}
        basePath={basePath}
        template="forge"
      />
      <main className="relative z-[1] flex w-full flex-1 flex-col pb-[calc(var(--space-16)+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]">
        {children}
        <ForgeFooter data={data} />
      </main>
      <BookBarSection bookHref={bookHref} suspended={isSuspended} />
    </div>
  );
}
