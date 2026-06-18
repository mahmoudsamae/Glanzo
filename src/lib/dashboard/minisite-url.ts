import { clientEnv } from "@/lib/env";
import { allowsDirectTenantPaths } from "@/lib/tenant";

/** Public mini-site URL for a shop slug on the current root domain. */
export function buildShopMinisiteUrl(slug: string): string {
  const rootDomain = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  if (allowsDirectTenantPaths(rootDomain)) {
    return `${protocol}://${rootDomain}/s/${slug}`;
  }
  return `${protocol}://${slug}.${rootDomain}`;
}

/** Display hostname only (no protocol) for chrome labels. */
export function formatShopMinisiteHost(slug: string): string {
  const rootDomain = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  if (allowsDirectTenantPaths(rootDomain)) {
    return `${rootDomain}/s/${slug}`;
  }
  return `${slug}.${rootDomain}`;
}
