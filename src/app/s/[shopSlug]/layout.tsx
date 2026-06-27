import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { deriveAccentCssVars } from "@/lib/color/accent";
import { shopSlugSchema } from "@/lib/validations/shop";
import { getMinisiteTemplate } from "@/features/minisite";
import { loadPublicShopBySlug } from "@/server/modules/shops/shops.loader";

import "@/styles/themes/classic.css";
import "@/styles/themes/midnight.css";
import "@/styles/themes/bold.css";
import "@/styles/themes/signature.css";
import "@/styles/themes/boutique.css";
import "@/styles/themes/nicoles.css";
import "@/styles/themes/flux.css";
import "@/styles/themes/mecca.css";
import "@/styles/themes/forge.css";

export const revalidate = 300;

export default async function ShopLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ shopSlug: string }>;
}>) {
  const { shopSlug } = await params;
  const parsed = shopSlugSchema.safeParse(shopSlug);
  if (!parsed.success) {
    notFound();
  }

  const data = await loadPublicShopBySlug(parsed.data);
  if (!data) {
    notFound();
  }

  const template = getMinisiteTemplate(data.minisite.template);
  const accentVars = deriveAccentCssVars(data.minisite.accent_hex, data.minisite.template);

  return (
    <div
      className={`minisite ${template.themeClass} ${template.fontClass} min-h-full flex flex-1 flex-col`}
      style={accentVars as CSSProperties}
    >
      {children}
    </div>
  );
}
