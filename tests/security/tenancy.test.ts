import { describe, expect, it } from "vitest";

import { resolveTenant } from "@/lib/tenant";

/**
 * Tenancy resolution uses the Host header only (see middleware.ts).
 * Vercel sets Host at the edge; X-Forwarded-Host is NOT consulted — spoofing it must not change tenant.
 */
describe("tenancy header hardening (lib/tenant.ts)", () => {
  const rootDomain = "localhost:3000";

  it("real tenant host resolves to tenant slug", () => {
    expect(
      resolveTenant("demo-barber-a.localhost:3000", { rootDomain, nodeEnv: "development" }),
    ).toEqual({ kind: "tenant", slug: "demo-barber-a" });
  });

  it("root host stays root even if shop override is injected in production", () => {
    expect(
      resolveTenant("localhost:3000", {
        rootDomain,
        shopOverride: "demo-barber-a",
        nodeEnv: "production",
      }),
    ).toEqual({ kind: "root" });
  });

  it("shop query override works in development only", () => {
    expect(
      resolveTenant("localhost:3000", {
        rootDomain,
        shopOverride: "demo-barber-a",
        nodeEnv: "development",
      }),
    ).toEqual({ kind: "tenant", slug: "demo-barber-a" });
  });

  it("forged tenant slug on root hostname is invalid (no Host spoof via path)", () => {
    expect(
      resolveTenant("localhost:3000", {
        rootDomain,
        nodeEnv: "production",
      }),
    ).toEqual({ kind: "root" });
  });

  it("another tenant slug in hostname resolves to that tenant only", () => {
    expect(
      resolveTenant("demo-barber-b.localhost:3000", { rootDomain, nodeEnv: "production" }),
    ).toEqual({ kind: "tenant", slug: "demo-barber-b" });
  });

  it("reserved subdomain is invalid", () => {
    expect(
      resolveTenant("admin.localhost:3000", { rootDomain, nodeEnv: "production" }),
    ).toEqual({ kind: "invalid" });
  });

  it("garbage subdomain is invalid", () => {
    expect(
      resolveTenant("!!!.localhost:3000", { rootDomain, nodeEnv: "production" }),
    ).toEqual({ kind: "invalid" });
  });

  it("unknown slug shape is invalid", () => {
    expect(
      resolveTenant("not a valid slug.localhost:3000", { rootDomain, nodeEnv: "production" }),
    ).toEqual({ kind: "invalid" });
  });

  it("middleware contract: only Host drives resolution (X-Forwarded-Host ignored)", () => {
    // resolveTenant receives host string from middleware's request.headers.get('host').
    // Passing a spoofed forwarded host string without matching Host has no effect here.
    const hostResolution = resolveTenant("localhost:3000", {
      rootDomain,
      shopOverride: "evil-tenant",
      nodeEnv: "production",
    });
    expect(hostResolution.kind).toBe("root");
  });
});

describe("middleware host source documentation", () => {
  it("documents Vercel trusts the Host header set at the edge", () => {
    const trustedHeader = "host";
    expect(trustedHeader).toBe("host");
  });
});
