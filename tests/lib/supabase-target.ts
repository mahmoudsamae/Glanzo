/** CI Supabase stack defaults (`supabase start` on GitHub Actions). */
export const CI_SUPABASE_URL = "http://127.0.0.1:54321";
export const CI_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

/**
 * Resolve Supabase target for Vitest RLS/security suites.
 * Local: NEXT_PUBLIC_* from .env.local (your hosted dev project).
 * CI: ephemeral stack from `supabase start`.
 */
export function resolveSupabaseTarget(): { url: string; anonKey: string; source: "app" | "ci" } {
  const appUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const appAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (appUrl && appAnon && !appUrl.includes("127.0.0.1")) {
    return { url: appUrl, anonKey: appAnon, source: "app" };
  }

  if (appUrl && appAnon) {
    return { url: appUrl, anonKey: appAnon, source: "app" };
  }

  return {
    url: CI_SUPABASE_URL,
    anonKey: CI_SUPABASE_ANON_KEY,
    source: "ci",
  };
}

const target = resolveSupabaseTarget();

export const SUPABASE_URL = target.url;
export const SUPABASE_ANON_KEY = target.anonKey;
export const SUPABASE_TARGET_SOURCE = target.source;

/** @deprecated Use SUPABASE_URL */
export const LOCAL_SUPABASE_URL = SUPABASE_URL;

/** @deprecated Use SUPABASE_ANON_KEY */
export const LOCAL_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

export async function isSupabaseReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

export async function assertSupabaseRequired(): Promise<void> {
  const up = await isSupabaseReachable();
  if (up) return;

  throw new Error(
    "Supabase unreachable. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (Dashboard → API).",
  );
}

if (process.env.REQUIRE_SUPABASE === "1") {
  await assertSupabaseRequired();
}
