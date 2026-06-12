import { clientEnv } from "@/lib/env";

/** Public mini-site URL for a shop slug on the current root domain. */
export function buildShopMinisiteUrl(slug: string): string {
  const rootDomain = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  // Local dev: `/s/{slug}` works on every OS; `*.localhost` subdomains are flaky on Windows.
  if (rootDomain.includes("localhost")) {
    return `${protocol}://${rootDomain}/s/${slug}`;
  }
  return `${protocol}://${slug}.${rootDomain}`;
}

/** Display hostname only (no protocol) for chrome labels. */
export function formatShopMinisiteHost(slug: string): string {
  return `${slug}.${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}`;
}
