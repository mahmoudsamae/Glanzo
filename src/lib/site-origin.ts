import { clientEnv } from "@/lib/env";

/** Marketing / app origin for sitemap, JSON-LD, OG (root only in V1). */
export function siteOrigin(): string {
  const rootDomain = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  if (rootDomain.includes("localhost")) {
    return `${protocol}://${rootDomain}`;
  }
  return `${protocol}://${rootDomain}`;
}
