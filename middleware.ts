import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/lib/env";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";
import {
  buildTenantRewritePath,
  isDirectTenantPath,
  allowsDirectTenantPaths,
  resolveTenant,
  TENANT_NOT_FOUND_SLUG,
  TENANT_PATH_FORBIDDEN_SLUG,
} from "@/lib/tenant";

function resolveTenantResponse(request: NextRequest): NextResponse {
  const host = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === "production";
  const shopOverride = request.nextUrl.searchParams.get("shop");

  const resolution = resolveTenant(host, {
    rootDomain: clientEnv.NEXT_PUBLIC_ROOT_DOMAIN,
    shopOverride,
    nodeEnv: process.env.NODE_ENV,
  });

  if (
    isProduction &&
    resolution.kind === "root" &&
    isDirectTenantPath(pathname) &&
    !allowsDirectTenantPaths(clientEnv.NEXT_PUBLIC_ROOT_DOMAIN)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = buildTenantRewritePath(TENANT_PATH_FORBIDDEN_SLUG, "/");
    return NextResponse.rewrite(url);
  }

  if (resolution.kind === "invalid") {
    const url = request.nextUrl.clone();
    url.pathname = buildTenantRewritePath(TENANT_NOT_FOUND_SLUG, "/");
    return NextResponse.rewrite(url);
  }

  if (resolution.kind === "tenant") {
    const url = request.nextUrl.clone();
    url.pathname = buildTenantRewritePath(resolution.slug, pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next({ request });
}

/** Root-domain auth session refresh — skipped for tenant subdomains (public mini-sites). */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const resolution = resolveTenant(host, {
    rootDomain: clientEnv.NEXT_PUBLIC_ROOT_DOMAIN,
    shopOverride: request.nextUrl.searchParams.get("shop"),
    nodeEnv: process.env.NODE_ENV,
  });

  const tenantResponse = resolveTenantResponse(request);

  if (resolution.kind === "tenant" || resolution.kind === "invalid") {
    return tenantResponse;
  }

  return refreshSupabaseSession(request, tenantResponse);
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|ico)$).*)",
  ],
};
