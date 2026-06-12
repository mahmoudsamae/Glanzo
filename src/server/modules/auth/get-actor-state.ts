import type { Actor, ActorState, PostAuthRedirect } from "./types";
import { getActor } from "./get-actor";

/** Default landing after successful sign-in / registration / OAuth. */
export function resolvePostAuthRedirect(actor: Actor): PostAuthRedirect {
  if (actor.memberships.length > 0) {
    return "/d";
  }

  if (actor.isPlatformAdmin) {
    return "/admin";
  }

  return "/onboarding";
}

/**
 * Single routing brain for auth guards and post-auth redirects.
 * Used by callback, login action, dashboard/auth layouts.
 */
export async function getActorState(): Promise<ActorState> {
  const actor = await getActor();

  if (!actor) {
    return { kind: "unauthenticated", redirectTo: "/login" };
  }

  if (actor.memberships.length > 0) {
    return { kind: "has_shop", redirectTo: "/d", actor };
  }

  if (actor.isPlatformAdmin) {
    return { kind: "platform_admin", redirectTo: "/admin", actor };
  }

  return { kind: "needs_onboarding", redirectTo: "/onboarding", actor };
}

export function actorHasShop(actor: Actor): boolean {
  return actor.memberships.length > 0;
}
