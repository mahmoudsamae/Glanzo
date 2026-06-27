import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authFlowLog } from "@/lib/auth/flow-log";

import type { Actor, ActorMembership } from "./types";

async function loadProfileWithMemberships(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
) {
  return supabase
    .from("profiles")
    .select(
      `
        *,
        memberships (
          id,
          role,
          archived_at,
          created_at,
          shop:shops (
            id,
            name,
            slug,
            timezone,
            dashboard_nav_keys
          )
        )
      `,
    )
    .eq("id", userId)
    .maybeSingle();
}

/**
 * Session → profile + active memberships + platform-admin flag.
 * One PostgREST round-trip via nested select.
 */
export async function getActor(): Promise<Actor | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    authFlowLog("get-user", { ok: false, message: userError.message });
    return null;
  }

  if (!user) {
    return null;
  }

  let profileResult = await loadProfileWithMemberships(supabase, user.id);

  if (profileResult.error || !profileResult.data) {
    authFlowLog("profile-load", {
      ok: false,
      userId: user.id,
      message: profileResult.error?.message ?? "missing-profile",
    });

    const { error: ensureError } = await supabase.rpc("ensure_user_profile");
    if (ensureError) {
      authFlowLog("profile-ensure", {
        ok: false,
        userId: user.id,
        message: ensureError.message,
      });
      return null;
    }

    profileResult = await loadProfileWithMemberships(supabase, user.id);
    if (profileResult.error || !profileResult.data) {
      authFlowLog("profile-reload", {
        ok: false,
        userId: user.id,
        message: profileResult.error?.message ?? "still-missing-profile",
      });
      return null;
    }
  }

  const profile = profileResult.data;
  const [adminResult] = await Promise.all([supabase.rpc("is_platform_admin")]);

  const memberships: ActorMembership[] = (profile.memberships ?? [])
    .filter((membership) => membership.archived_at === null && membership.shop)
    .map((membership) => {
      const shop = membership.shop!;
      return {
        id: membership.id,
        role: membership.role,
        shopId: shop.id,
        shopName: shop.name,
        shopSlug: shop.slug,
        shopTimezone: shop.timezone,
        dashboardNavKeys: shop.dashboard_nav_keys ?? null,
        createdAt: membership.created_at,
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    },
    memberships,
    isPlatformAdmin: Boolean(adminResult.data),
  };
}
