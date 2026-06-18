import { redirect } from "next/navigation";

import { revalidateShopPublic } from "@/lib/minisite/revalidate-shop-public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CheckSlugResult, CreateShopErrorCode, CreateShopResult } from "@/lib/auth/types";
import {
  createShopInputSchema,
  type CreateShopInput,
} from "@/lib/validations/shop";
import { getActor } from "@/server/modules/auth/get-actor";
import { getActorState, resolvePostAuthRedirect } from "@/server/modules/auth/get-actor-state";
import { getActiveMembership } from "@/lib/dashboard/active-shop";

function mapRpcError(message: string): CreateShopErrorCode {
  const upper = message.toUpperCase();
  if (upper.includes("NOT_AUTHENTICATED")) return "NOT_AUTHENTICATED";
  if (upper.includes("SLUG_INVALID")) return "SLUG_INVALID";
  if (upper.includes("SLUG_RESERVED")) return "SLUG_RESERVED";
  if (upper.includes("SLUG_TAKEN")) return "SLUG_TAKEN";
  if (upper.includes("SLUG_OWNED")) return "SLUG_OWNED";
  if (upper.includes("TIMEZONE_INVALID")) return "TIMEZONE_INVALID";
  if (upper.includes("INVALID_NAME")) return "INVALID_NAME";
  return "UNKNOWN";
}

/**
 * Atomic shop creation via SECURITY DEFINER RPC — called as the authenticated user,
 * not service role. Privileged inserts and audit row live inside Postgres.
 */
export async function createShop(input: CreateShopInput): Promise<CreateShopResult> {
  const parsed = createShopInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const state = await getActorState();
  if (state.kind === "unauthenticated") {
    return { ok: false, code: "NOT_AUTHENTICATED" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_shop_with_owner", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_timezone: parsed.data.timezone,
    p_opening_hours: parsed.data.openingHours,
  });

  if (error) {
    return { ok: false, code: mapRpcError(error.message) };
  }

  if (!data) {
    return { ok: false, code: "UNKNOWN" };
  }

  revalidateShopPublic(data.id);
  return { ok: true, shopSlug: data.slug };
}

export async function createShopAndRedirect(input: CreateShopInput): Promise<CreateShopResult> {
  const result = await createShop(input);
  if (result.ok) {
    redirect("/d");
  }
  return result;
}

export async function checkShopSlugAvailability(slug: string): Promise<CheckSlugResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "NOT_AUTHENTICATED" };
  }

  const { data, error } = await supabase.rpc("is_shop_slug_available", {
    p_slug: slug,
  });

  if (error) {
    if (error.message.toUpperCase().includes("SLUG")) {
      return { ok: false, code: "SLUG_INVALID" };
    }
    return { ok: false, code: "UNKNOWN" };
  }

  return { ok: true, available: Boolean(data) };
}

export async function redirectIfAuthenticatedFromAuthPages(): Promise<void> {
  const state = await getActorState();
  if (state.kind === "unauthenticated") {
    return;
  }

  redirect(resolvePostAuthRedirect(state.actor));
}

export async function requireOwnerDashboardAccess(): Promise<{
  actor: NonNullable<Awaited<ReturnType<typeof getActor>>>;
  shopId: string;
}> {
  await requireDashboardAccess();
  const actor = await getActor();
  const membership = getActiveMembership(actor?.memberships ?? []);

  if (!actor || !membership) {
    redirect("/login");
  }

  if (membership.role !== "owner") {
    redirect("/d");
  }

  return { actor, shopId: membership.shopId };
}

export async function requireDashboardAccess(): Promise<void> {
  const state = await getActorState();

  if (state.kind === "unauthenticated") {
    redirect("/login");
  }

  if (state.kind === "needs_onboarding") {
    redirect("/onboarding");
  }

  if (state.kind === "platform_admin" && state.actor.memberships.length === 0) {
    redirect("/admin");
  }
}

export async function requireOnboardingAccess(): Promise<void> {
  const state = await getActorState();

  if (state.kind === "unauthenticated") {
    redirect("/login");
  }

  if (state.kind === "has_shop") {
    redirect("/d");
  }

  if (state.kind === "platform_admin") {
    redirect("/admin");
  }
}

export async function requirePlatformAdmin(): Promise<void> {
  const state = await getActorState();

  if (state.kind === "unauthenticated") {
    redirect("/admin");
  }

  if (!state.actor.isPlatformAdmin) {
    redirect(resolvePostAuthRedirect(state.actor));
  }
}

export async function getDashboardShopName(): Promise<string | null> {
  const state = await getActorState();
  if (state.kind !== "has_shop" && state.kind !== "platform_admin") {
    return null;
  }

  return state.actor.memberships[0]?.shopName ?? null;
}
