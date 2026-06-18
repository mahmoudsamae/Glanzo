import { notFound } from "next/navigation";

import { shopSlugSchema } from "@/lib/validations/shop";
import { loadPublicShopBySlug } from "@/server/modules/shops/shops.loader";
import { BoutiqueNav } from "@/features/minisite/templates/boutique/boutique-nav.client";
import { BoutiqueAboutPage } from "@/features/minisite/templates/boutique/sections/boutique-about-page";
import { BoutiqueVisitPanel } from "@/features/minisite/templates/boutique/sections/boutique-visit-panel";
import { BoutiqueAmbient } from "@/features/minisite/templates/boutique/boutique-ambient.client";
import { NicolesAboutPage } from "@/features/minisite/templates/nicoles/about/nicoles-about-page";
import { NicolesAmbient } from "@/features/minisite/templates/nicoles/nicoles-ambient.client";
import { NicolesFooter } from "@/features/minisite/templates/nicoles/nicoles-footer";
import { NicolesNav } from "@/features/minisite/templates/nicoles/nicoles-nav.client";
import { BookBarSection } from "@/features/minisite/sections/book-bar";

export const revalidate = 300;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const parsed = shopSlugSchema.safeParse(shopSlug);
  if (!parsed.success) notFound();

  const data = await loadPublicShopBySlug(parsed.data);
  if (!data) notFound();

  const bookHref = `/s/${parsed.data}?book=1`;
  const basePath = `/s/${parsed.data}`;
  const isSuspended = data.shop.status === "suspended";

  if (data.minisite.template === "nicoles") {
    return (
      <div className="ms-nicoles-root relative flex min-h-full flex-1 flex-col">
        <NicolesAmbient />
        <NicolesNav
          shopName={data.shop.name}
          content={data.minisite.content}
          bookHref={bookHref}
          basePath={basePath}
        />
        <main className="relative z-[1] flex w-full flex-1 flex-col pb-[calc(var(--space-16)+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]">
          <NicolesAboutPage data={data} />
          <NicolesFooter data={data} />
        </main>
        <BookBarSection bookHref={bookHref} suspended={isSuspended} />
      </div>
    );
  }

  return (
    <div className="ms-boutique-root relative flex min-h-full flex-1 flex-col">
      <BoutiqueAmbient />
      <BoutiqueNav
        shopName={data.shop.name}
        content={data.minisite.content}
        bookHref={bookHref}
        basePath={basePath}
      />
      <main className="relative z-[1] flex w-full flex-1 flex-col pb-[calc(var(--space-16)+env(safe-area-inset-bottom))] lg:pb-[var(--space-8)]">
        <BoutiqueAboutPage data={data} bookHref={bookHref} />
        <BoutiqueVisitPanel data={data} />
      </main>
    </div>
  );
}
