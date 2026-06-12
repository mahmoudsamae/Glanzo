import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/site-origin";

/** V1: root sitemap only — no per-tenant sitemaps. */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  return [
    {
      url: origin,
      lastModified: new Date(),
    },
  ];
}
