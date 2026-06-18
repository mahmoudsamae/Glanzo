/**
 * Static salon stock photos in /public/classic — used when a shop has not uploaded media.
 * Paths are site-root URLs (Next.js public folder).
 */
const C = "/classic";

export const TEMPLATE_STOCK = {
  hero: `${C}/hero.jpg`,
  about: `${C}/about.jpg`,
  booking: `${C}/booking-bg.jpg`,
  kontakt: `${C}/gallery-04.jpg`,
  gallery: [
    `${C}/gallery-01.jpg`,
    `${C}/gallery-02.jpg`,
    `${C}/about.jpg`,
    `${C}/gallery-03.jpg`,
    `${C}/gallery-04.jpg`,
    `${C}/gallery-05.jpg`,
    `${C}/barber-01.jpg`,
    `${C}/gallery-06.jpg`,
  ] as const,
  services: [
    `${C}/service-haircut.jpg`,
    `${C}/gallery-03.jpg`,
    `${C}/service-styling.jpg`,
    `${C}/service-shave.jpg`,
    `${C}/barber-02.jpg`,
    `${C}/barber-03.jpg`,
  ] as const,
  team: [`${C}/gallery-03.jpg`, `${C}/barber-01.jpg`, `${C}/barber-02.jpg`] as const,
  news: [`${C}/gallery-05.jpg`, `${C}/service-beard.jpg`, `${C}/gallery-02.jpg`] as const,
} as const;

export function isTemplateStockPath(path: string): boolean {
  return path.startsWith("/classic/");
}
