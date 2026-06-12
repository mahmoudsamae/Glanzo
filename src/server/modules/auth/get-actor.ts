import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { Actor, ActorMembership } from "./types";

/**
 * Session → profile + active memberships + platform-admin flag.
 * One PostgREST round-trip via nested select.
 */
export async function getActor(): Promise<Actor | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [profileResult, adminResult] = await Promise.all([
    supabase
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
            timezone
          )
        )
      `,
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase.rpc("is_platform_admin"),
  ]);

  const profile = profileResult.data;
  const profileError = profileResult.error;

  if (profileError || !profile) {
    return null;
  }

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
