import { clientEnv } from "@/lib/env";
import { allowsDirectTenantPaths, normalizeRootDomain } from "@/lib/tenant";

export function buildShopMinisiteUrlForDomain(slug: string, rootDomain: string): string {
  const host = normalizeRootDomain(rootDomain);
  const protocol = host.includes("localhost") ? "http" : "https";
  if (allowsDirectTenantPaths(host)) {
    return `${protocol}://${host}/s/${slug}`;
  }
  return `${protocol}://${slug}.${host}`;
}

/** Public mini-site URL for a shop slug on the current root domain. */
export function buildShopMinisiteUrl(slug: string): string {
  return buildShopMinisiteUrlForDomain(slug, clientEnv.NEXT_PUBLIC_ROOT_DOMAIN);
}

/** Display hostname only (no protocol) for chrome labels. */
export function formatShopMinisiteHost(slug: string): string {
  const host = normalizeRootDomain(clientEnv.NEXT_PUBLIC_ROOT_DOMAIN);
  if (allowsDirectTenantPaths(host)) {
    return `${host}/s/${slug}`;
  }
  return `${slug}.${host}`;
}
