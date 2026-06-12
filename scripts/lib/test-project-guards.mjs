/**
 * Safety checks before destructive remote DB scripts (reset/seed).
 */

const SEED_EMAIL_DOMAIN = "@glanzo.test";

export function extractProjectRefFromSupabaseUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    const match = hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return match?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

/** Resolve linked project from standard app env vars. */
export function assertLinkedProjectTarget(overrides = {}) {
  const url = overrides.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = overrides.serviceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url?.trim()) {
    throw new Error("ABORT: NEXT_PUBLIC_SUPABASE_URL is required.");
  }

  if (!serviceKey?.trim()) {
    throw new Error("ABORT: SUPABASE_SERVICE_ROLE_KEY is required for reset/seed scripts.");
  }

  const refFromUrl = extractProjectRefFromSupabaseUrl(url.trim());
  if (!refFromUrl) {
    throw new Error(
      `ABORT: NEXT_PUBLIC_SUPABASE_URL "${url}" is not a hosted Supabase URL (expected https://<ref>.supabase.co).`,
    );
  }

  return { url: url.trim(), projectRef: refFromUrl, serviceKey: serviceKey.trim() };
}

export async function assertSafeToSeed(url, serviceKey) {
  if (!serviceKey?.trim()) {
    throw new Error("ABORT: SUPABASE_SERVICE_ROLE_KEY is required to verify seed safety.");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: {
      Authorization: `Bearer ${serviceKey.trim()}`,
      apikey: serviceKey.trim(),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `ABORT: could not list auth users for seed safety check (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  const payload = await response.json();
  const users = payload.users ?? [];

  const foreignUsers = users.filter((user) => {
    const email = String(user.email ?? "").toLowerCase();
    return email && !email.endsWith(SEED_EMAIL_DOMAIN);
  });

  if (foreignUsers.length > 0) {
    const sample = foreignUsers
      .slice(0, 3)
      .map((user) => user.email)
      .join(", ");
    throw new Error(
      `ABORT: refusing to seed — ${foreignUsers.length} non-${SEED_EMAIL_DOMAIN} user(s) exist (e.g. ${sample}). Use a disposable dev project or clear users first.`,
    );
  }
}
