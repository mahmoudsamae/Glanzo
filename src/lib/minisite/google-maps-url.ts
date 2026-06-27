/**
 * Google Maps share links sometimes use the invalid host `google.maps.com`
 * (NXDOMAIN). Rewrite to `www.google.com/maps/...` and fall back to address search.
 */
export function normalizeGoogleMapsUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }

  const host = parsed.hostname.toLowerCase();

  if (host === "google.maps.com" || host === "www.google.maps.com") {
    if (!parsed.pathname.startsWith("/maps")) {
      parsed.pathname = `/maps${parsed.pathname}`;
    }
    parsed.protocol = "https:";
    parsed.hostname = "www.google.com";
    return parsed.toString();
  }

  return parsed.toString();
}

export function resolveGoogleMapsHref(options: {
  googleMaps?: string | null;
  address?: string | null;
}): string {
  const custom = options.googleMaps?.trim();
  if (custom) {
    const normalized = normalizeGoogleMapsUrl(custom);
    if (normalized) {
      try {
        const host = new URL(normalized).hostname.toLowerCase();
        if (!host.includes("google.maps.com")) {
          return normalized;
        }
      } catch {
        /* fall through to address */
      }
    }
  }

  const address = options.address?.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return "";
}

/** iframe embed — shows map with pin at address or custom Maps link. */
export function resolveGoogleMapsEmbedUrl(options: {
  googleMaps?: string | null;
  address?: string | null;
  zoom?: number;
}): string {
  const zoom = options.zoom ?? 16;
  const address = options.address?.trim();
  const custom = options.googleMaps?.trim();

  if (custom) {
    const normalized = normalizeGoogleMapsUrl(custom);
    if (normalized.includes("/embed")) {
      return normalized;
    }

    try {
      const url = new URL(normalized);
      const query = url.searchParams.get("q");
      if (query) {
        return buildGoogleMapsEmbedUrl(query, zoom);
      }

      const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/i);
      if (placeMatch?.[1]) {
        return buildGoogleMapsEmbedUrl(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")), zoom);
      }
    } catch {
      /* fall through */
    }
  }

  if (address) {
    return buildGoogleMapsEmbedUrl(address, zoom);
  }

  return "";
}

function buildGoogleMapsEmbedUrl(query: string, zoom: number): string {
  const params = new URLSearchParams({
    q: query,
    hl: "de",
    z: String(zoom),
    output: "embed",
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}
