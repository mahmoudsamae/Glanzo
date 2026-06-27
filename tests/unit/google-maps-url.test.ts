import { describe, expect, it } from "vitest";

import { normalizeGoogleMapsUrl, resolveGoogleMapsEmbedUrl, resolveGoogleMapsHref } from "@/lib/minisite/google-maps-url";

describe("google maps url", () => {
  it("rewrites invalid google.maps.com host", () => {
    expect(
      normalizeGoogleMapsUrl(
        "https://google.maps.com/place/Leopoldauer+Pl.+13,+1210+Wien,+Austria",
      ),
    ).toBe("https://www.google.com/maps/place/Leopoldauer+Pl.+13,+1210+Wien,+Austria");
  });

  it("keeps valid www.google.com/maps links", () => {
    const url = "https://www.google.com/maps/place/Berlin";
    expect(normalizeGoogleMapsUrl(url)).toBe(url);
  });

  it("keeps maps.google.com links", () => {
    const url = "https://maps.google.com/?q=Berlin";
    expect(normalizeGoogleMapsUrl(url)).toBe(url);
  });

  it("adds https when missing", () => {
    expect(normalizeGoogleMapsUrl("maps.google.com/?q=Berlin")).toBe(
      "https://maps.google.com/?q=Berlin",
    );
  });

  it("falls back to address search when custom link is empty", () => {
    expect(
      resolveGoogleMapsHref({
        address: "Leopoldauer Pl. 13, 1210 Wien",
      }),
    ).toBe(
      "https://www.google.com/maps/search/?api=1&query=Leopoldauer%20Pl.%2013%2C%201210%20Wien",
    );
  });

  it("normalizes stored google_maps before opening", () => {
    expect(
      resolveGoogleMapsHref({
        googleMaps: "https://google.maps.com/place/Test",
        address: "Fallback address",
      }),
    ).toBe("https://www.google.com/maps/place/Test");
  });

  it("builds embed url with marker query", () => {
    const embed = resolveGoogleMapsEmbedUrl({
      address: "Leopoldauer Pl. 13, 1210 Wien",
    });
    expect(embed).toContain("maps.google.com/maps?");
    expect(embed).toContain("output=embed");
    expect(embed).toContain("Leopoldauer");
    expect(embed).toContain("1210");
  });
});
