import { describe, expect, it } from "vitest";

import { resolveTenant } from "@/lib/tenant";

const ROOT = "localhost:3000";
const PROD_ROOT = "glanzo.app";

describe("resolveTenant", () => {
  it("resolves exact root host", () => {
    expect(resolveTenant("localhost:3000", { rootDomain: ROOT })).toEqual({ kind: "root" });
  });

  it("resolves www as root", () => {
    expect(resolveTenant("www.localhost:3000", { rootDomain: ROOT })).toEqual({ kind: "root" });
    expect(resolveTenant("www.glanzo.app", { rootDomain: PROD_ROOT })).toEqual({ kind: "root" });
  });

  it("resolves production root without port", () => {
    expect(resolveTenant("glanzo.app", { rootDomain: PROD_ROOT })).toEqual({ kind: "root" });
  });

  it("resolves valid tenant subdomain on localhost dev", () => {
    expect(resolveTenant("demo-barber-a.localhost:3000", { rootDomain: ROOT })).toEqual({
      kind: "tenant",
      slug: "demo-barber-a",
    });
  });

  it("resolves valid tenant subdomain on production root", () => {
    expect(resolveTenant("demo-barber-a.glanzo.app", { rootDomain: PROD_ROOT })).toEqual({
      kind: "tenant",
      slug: "demo-barber-a",
    });
  });

  it("treats reserved subdomains as invalid", () => {
    expect(resolveTenant("admin.localhost:3000", { rootDomain: ROOT })).toEqual({ kind: "invalid" });
    expect(resolveTenant("api.glanzo.app", { rootDomain: PROD_ROOT })).toEqual({ kind: "invalid" });
  });

  it("rejects deep subdomains", () => {
    expect(resolveTenant("a.b.localhost:3000", { rootDomain: ROOT })).toEqual({ kind: "invalid" });
    expect(resolveTenant("shop.demo.glanzo.app", { rootDomain: PROD_ROOT })).toEqual({
      kind: "invalid",
    });
  });

  it("rejects malformed hosts", () => {
    expect(resolveTenant("", { rootDomain: ROOT })).toEqual({ kind: "invalid" });
    expect(resolveTenant("not-localhost", { rootDomain: ROOT })).toEqual({ kind: "invalid" });
  });

  it("rejects port mismatch against root domain port", () => {
    expect(resolveTenant("demo-barber-a.localhost:4000", { rootDomain: ROOT })).toEqual({
      kind: "invalid",
    });
  });

  it("normalizes uppercase hosts", () => {
    expect(resolveTenant("DEMO-BARBER-A.LOCALHOST:3000", { rootDomain: ROOT })).toEqual({
      kind: "tenant",
      slug: "demo-barber-a",
    });
    expect(resolveTenant("WWW.LOCALHOST:3000", { rootDomain: ROOT })).toEqual({
      kind: "root",
    });
  });

  it("treats vercel preview URLs as root", () => {
    expect(resolveTenant("glanzo-git-main-acme.vercel.app", { rootDomain: PROD_ROOT })).toEqual({
      kind: "root",
    });
  });

  it("rejects slug that is too short", () => {
    expect(resolveTenant("ab.localhost:3000", { rootDomain: ROOT })).toEqual({ kind: "invalid" });
  });

  it("rejects slug that is too long", () => {
    const slug = "a".repeat(41);
    expect(resolveTenant(`${slug}.localhost:3000`, { rootDomain: ROOT })).toEqual({ kind: "invalid" });
  });

  it("rejects illegal slug characters", () => {
    expect(resolveTenant("Bad_Shop.localhost:3000", { rootDomain: ROOT })).toEqual({ kind: "invalid" });
    expect(resolveTenant("shop!.glanzo.app", { rootDomain: PROD_ROOT })).toEqual({ kind: "invalid" });
  });

  it("applies dev shop override on root when not production", () => {
    expect(
      resolveTenant("localhost:3000", {
        rootDomain: ROOT,
        shopOverride: "demo-barber-a",
        nodeEnv: "development",
      }),
    ).toEqual({ kind: "tenant", slug: "demo-barber-a" });
  });

  it("ignores dev shop override in production", () => {
    expect(
      resolveTenant("localhost:3000", {
        rootDomain: ROOT,
        shopOverride: "demo-barber-a",
        nodeEnv: "production",
      }),
    ).toEqual({ kind: "root" });
  });
});
