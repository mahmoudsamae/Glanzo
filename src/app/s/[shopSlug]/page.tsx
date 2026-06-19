import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BookingSheetGate } from "@/features/booking";
import { CustomerBookingAccess } from "@/features/booking/components/customer-booking-access.client";
import { MinisiteShell } from "@/features/minisite";
import { shopMediaPublicUrl } from "@/lib/minisite/media-url";
import { shopJsonLdScript } from "@/lib/minisite/json-ld";
import { siteOrigin } from "@/lib/site-origin";
import { shopSlugSchema } from "@/lib/validations/shop";
import { loadPublicShopBySlug } from "@/server/modules/shops/shops.loader";

export const revalidate = 300;

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ book?: string }>;
}) {
  const { shopSlug } = await params;
  const { book } = await searchParams;
  const parsed = shopSlugSchema.safeParse(shopSlug);
  if (!parsed.success) {
    notFound();
  }

  const data = await loadPublicShopBySlug(parsed.data);
  if (!data) {
    notFound();
  }

  const jsonLd = shopJsonLdScript(data, siteOrigin());

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <MinisiteShell data={data} shopSlug={parsed.data} />
      <CustomerBookingAccess shopSlug={parsed.data} timezone={data.shop.timezone} />
      {book === "1" ? (
        <Suspense fallback={null}>
          <BookingSheetGate shopSlug={parsed.data} data={data} />
        </Suspense>
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const data = await loadPublicShopBySlug(shopSlug);

  if (!data) {
    return { title: "Shop | Glanzo" };
  }

  const title = `${data.shop.name} — Online buchen`;
  const description =
    data.minisite.content.about?.trim() ||
    data.minisite.content.hero_headline?.trim() ||
    title;
  const coverPath = data.minisite.content.cover_path;
  const ogImage = coverPath ? shopMediaPublicUrl(coverPath) : undefined;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };

  return metadata;
}
