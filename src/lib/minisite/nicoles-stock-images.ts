import type { MinisiteContent } from "@/lib/validations/public-shop";

import { TEMPLATE_STOCK } from "./template-stock-images";

export function nicolesStockGallery(index: number): string {
  return TEMPLATE_STOCK.gallery[index] ?? TEMPLATE_STOCK.gallery[0]!;
}

export function nicolesStockServiceCard(index: number): string {
  return TEMPLATE_STOCK.services[index] ?? TEMPLATE_STOCK.services[0]!;
}

export function nicolesStockTeam(index: number): string {
  return TEMPLATE_STOCK.team[index] ?? TEMPLATE_STOCK.team[0]!;
}

export function nicolesStockNews(index: number): string {
  return TEMPLATE_STOCK.news[index] ?? TEMPLATE_STOCK.news[0]!;
}

export function resolveNicolesCoverImage(content: MinisiteContent): string {
  return content.cover_path ?? TEMPLATE_STOCK.hero;
}

export function resolveNicolesGalleryImage(content: MinisiteContent, index: number): string {
  return content.gallery?.[index] ?? nicolesStockGallery(index);
}

export function resolveNicolesServiceCardImage(
  content: MinisiteContent,
  index: number,
  imagePath?: string,
): string {
  return imagePath ?? content.gallery?.[index] ?? nicolesStockServiceCard(index);
}

export function resolveNicolesPricesHeroImage(content: MinisiteContent): string {
  return content.sections?.prices?.image_path ?? resolveNicolesGalleryImage(content, 0);
}

export function resolveNicolesTerminHeroImage(content: MinisiteContent): string {
  return content.sections?.booking?.image_path ?? TEMPLATE_STOCK.booking;
}

export function resolveNicolesKontaktHeroImage(content: MinisiteContent): string {
  return content.sections?.contact?.image_path ?? TEMPLATE_STOCK.kontakt;
}

export function resolveNicolesAboutHeroImage(content: MinisiteContent, blockPath?: string): string {
  return (
    blockPath ??
    content.sections?.about?.image_path ??
    resolveNicolesGalleryImage(content, 2)
  );
}

export function resolveNicolesSalonBannerImage(content: MinisiteContent): string {
  return (
    content.sections?.salon_banner?.image_path ??
    content.cover_path ??
    resolveNicolesGalleryImage(content, 4)
  );
}

export function resolveNicolesAktionstageImage(content: MinisiteContent): string {
  return content.sections?.aktionstage?.image_path ?? resolveNicolesGalleryImage(content, 5);
}

export function resolveNicolesNewsImage(content: MinisiteContent, index: number, itemPath?: string): string {
  return itemPath ?? resolveNicolesGalleryImage(content, index) ?? nicolesStockNews(index);
}
