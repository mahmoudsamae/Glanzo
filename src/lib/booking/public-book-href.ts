/** Public minisite URL that opens the booking sheet (optional pre-selected service). */
export function buildPublicBookHref(
  shopSlug: string,
  options?: { serviceId?: string },
): string {
  const params = new URLSearchParams();
  params.set("book", "1");
  if (options?.serviceId) {
    params.set("service", options.serviceId);
  }
  return `/s/${shopSlug}?${params.toString()}`;
}
