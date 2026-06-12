import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and hyphenates simple names", () => {
    expect(slugify("Classic Cuts")).toBe("classic-cuts");
  });

  it("transliterates German umlauts", () => {
    expect(slugify("Müller Friseur")).toBe("mueller-friseur");
    expect(slugify("Größe & Stil")).toBe("groesse-stil");
    expect(slugify("Straße Barber")).toBe("strasse-barber");
  });

  it("transliterates Turkish characters", () => {
    expect(slugify("İstanbul Berber")).toBe("istanbul-berber");
    expect(slugify("Şahin Saç")).toBe("sahin-sac");
    expect(slugify("Çınar Kuaför")).toBe("cinar-kuafoer");
  });

  it("transliterates Arabic shop names sensibly", () => {
    expect(slugify("حلاق الرياض")).toBe("hlaq-alryad");
    expect(slugify("صالون دبي")).toBe("salwn-dby");
  });

  it("collapses repeated separators", () => {
    expect(slugify("A---B   C")).toBe("a-b-c");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("---shop---")).toBe("shop");
  });

  it("pads very short slugs to minimum length", () => {
    expect(slugify("AB")).toBe("ab0");
  });

  it("truncates to max slug length", () => {
    const long = "a".repeat(50);
    expect(slugify(long).length).toBeLessThanOrEqual(40);
  });

  it("handles mixed scripts", () => {
    expect(slugify("Berber Müller حلاق")).toMatch(/^[a-z0-9-]+$/);
  });

  it("returns empty string for symbols-only input", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("preserves digits", () => {
    expect(slugify("Shop 42")).toBe("shop-42");
  });
});
