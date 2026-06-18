import {
  isValidShopSlug,
  SHOP_SLUG_MAX_LENGTH,
  SHOP_SLUG_MIN_LENGTH,
} from "@/lib/validations/shop";

/** Subdomains that must never resolve as tenant hosts (also blocked at slug creation in Step 5). */
export const RESERVED_SUBDOMAINS = [
  "www",
  "app",
  "api",
  "admin",
  "mail",
  "staging",
  "demo",
] as const;

export type ReservedSubdomain = (typeof RESERVED_SUBDOMAINS)[number];

export type TenantResolution =
  | { kind: "root" }
  | { kind: "tenant"; slug: string }
  | { kind: "invalid" };

export type ResolveTenantOptions = {
  /** e.g. `glanzo.app` or `localhost:3000` from NEXT_PUBLIC_ROOT_DOMAIN */
  rootDomain?: string;
  /**
   * Dev-only tenant override for Vercel previews and local root testing.
   * Ignored when `nodeEnv === 'production'`.
   */
  shopOverride?: string | null;
  nodeEnv?: string;
};

const VERCEL_PREVIEW_SUFFIX = ".vercel.app";

/** Path-based mini-sites (`/s/{slug}`) — localhost dev and Vercel default domains (no wildcard DNS). */
export function allowsDirectTenantPaths(rootDomain: string): boolean {
  const normalized = rootDomain.trim().toLowerCase();
  return normalized.includes("localhost") || normalized.endsWith(VERCEL_PREVIEW_SUFFIX);
}

function isVercelPreviewHost(hostname: string, rootHostname: string): boolean {
  if (!hostname.endsWith(VERCEL_PREVIEW_SUFFIX)) {
    return false;
  }
  if (hostname === rootHostname || hostname === `www.${rootHostname}`) {
    return false;
  }
  if (hostname.endsWith(`.${rootHostname}`)) {
    return false;
  }
  return true;
}

function parseHostParts(host: string): { hostname: string; port: string | null } {
  const normalized = host.trim().toLowerCase();
  if (!normalized) {
    return { hostname: "", port: null };
  }

  if (normalized.startsWith("[")) {
    const closing = normalized.indexOf("]");
    if (closing === -1) {
      return { hostname: normalized, port: null };
    }
    const hostname = normalized.slice(0, closing + 1);
    const rest = normalized.slice(closing + 1);
    const port = rest.startsWith(":") ? rest.slice(1) : null;
    return { hostname, port };
  }

  const lastColon = normalized.lastIndexOf(":");
  const maybePort = lastColon > normalized.lastIndexOf(".");
  if (lastColon !== -1 && maybePort) {
    return {
      hostname: normalized.slice(0, lastColon),
      port: normalized.slice(lastColon + 1),
    };
  }

  return { hostname: normalized, port: null };
}

function parseRootDomain(rootDomain: string): { hostname: string; port: string | null } {
  return parseHostParts(rootDomain.trim().toLowerCase());
}

function isReservedSlug(slug: string): boolean {
  return (RESERVED_SUBDOMAINS as readonly string[]).includes(slug);
}

function validateTenantSlug(slug: string): TenantResolution {
  if (
    slug.length < SHOP_SLUG_MIN_LENGTH ||
    slug.length > SHOP_SLUG_MAX_LENGTH ||
    isReservedSlug(slug) ||
    !isValidShopSlug(slug)
  ) {
    return { kind: "invalid" };
  }
  return { kind: "tenant", slug };
}

/**
 * Pure host → tenant resolution. All host parsing for Glanzo lives here.
 */
export function resolveTenant(host: string, options: ResolveTenantOptions = {}): TenantResolution {
  const rootDomain = options.rootDomain ?? "glanzo.app";
  const nodeEnv = options.nodeEnv ?? "development";

  const { hostname, port } = parseHostParts(host);
  const root = parseRootDomain(rootDomain);

  if (!hostname) {
    return { kind: "invalid" };
  }

  // Random Vercel preview URLs (not subdomains of the configured root) use the root app.
  if (isVercelPreviewHost(hostname, root.hostname)) {
    return applyDevShopOverride({ kind: "root" }, options, nodeEnv);
  }

  if (root.port !== null && port !== null && port !== root.port) {
    return { kind: "invalid" };
  }

  if (hostname === root.hostname || hostname === `www.${root.hostname}`) {
    return applyDevShopOverride({ kind: "root" }, options, nodeEnv);
  }

  const tenantSuffix = `.${root.hostname}`;
  if (!hostname.endsWith(tenantSuffix)) {
    return { kind: "invalid" };
  }

  const subdomainPart = hostname.slice(0, -tenantSuffix.length);
  if (!subdomainPart || subdomainPart.includes(".")) {
    return { kind: "invalid" };
  }

  return validateTenantSlug(subdomainPart);
}

function applyDevShopOverride(
  resolution: TenantResolution,
  options: ResolveTenantOptions,
  nodeEnv: string,
): TenantResolution {
  if (nodeEnv === "production" || resolution.kind !== "root") {
    return resolution;
  }

  const override = options.shopOverride?.trim().toLowerCase();
  if (!override) {
    return resolution;
  }

  return validateTenantSlug(override);
}

/** Internal sentinel slug — fails validation, triggers notFound in shop layout. */
export const TENANT_NOT_FOUND_SLUG = "__tenant-not-found__";

/** Internal sentinel for prod-only direct /s/ path access on root host. */
export const TENANT_PATH_FORBIDDEN_SLUG = "__tenant-path-forbidden__";

export function buildTenantRewritePath(slug: string, pathname: string): string {
  const suffix = pathname === "/" ? "" : pathname;
  return `/s/${slug}${suffix}`;
}

export function isDirectTenantPath(pathname: string): boolean {
  return pathname === "/s" || pathname.startsWith("/s/");
}
