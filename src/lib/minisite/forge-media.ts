import { resolveNicolesGalleryImage } from "@/lib/minisite/nicoles-stock-images";
import type { MinisiteContent } from "@/lib/validations/public-shop";

/** Hero image on the right — section slot overrides Titelbild (cover). */
export function resolveForgeHeroImage(content: MinisiteContent): string {
  const sectionPath = content.sections?.hero?.image_paths?.[0]?.trim();
  if (sectionPath) return sectionPath;

  const cover = content.cover_path?.trim();
  if (cover) return cover;

  return resolveNicolesGalleryImage(content, 0);
}

/** About section portraits — only user-assigned paths (no gallery bleed). */
export function resolveForgeAboutImages(content: MinisiteContent): [string | undefined, string | undefined] {
  const paths = content.sections?.about?.image_paths ?? [];
  return [paths[0]?.trim() || undefined, paths[1]?.trim() || undefined];
}

/** Salon banner background — section slot, then cover, then stock. */
export function resolveForgeSalonBannerImage(content: MinisiteContent): string | undefined {
  const sectionPath = content.sections?.salon_banner?.image_path?.trim();
  if (sectionPath) return sectionPath;

  const cover = content.cover_path?.trim();
  if (cover) return cover;

  return resolveNicolesGalleryImage(content, 4);
}

/** Leistungen subpage hero. */
export function resolveForgePricesHeroImage(content: MinisiteContent): string {
  const sectionPath = content.sections?.prices?.image_path?.trim();
  if (sectionPath) return sectionPath;

  const cover = content.cover_path?.trim();
  if (cover) return cover;

  return resolveNicolesGalleryImage(content, 0);
}

/** Optional background behind the detailed price list on /leistungen. */
export function resolveForgePriceListBackground(content: MinisiteContent): string | undefined {
  return content.sections?.prices?.image_paths?.[0]?.trim() || undefined;
}

/** Kontakt subpage hero. */
export function resolveForgeKontaktHeroImage(content: MinisiteContent): string {
  const sectionPath = content.sections?.contact?.image_path?.trim();
  if (sectionPath) return sectionPath;

  const cover = content.cover_path?.trim();
  if (cover) return cover;

  return resolveNicolesGalleryImage(content, 2);
}
