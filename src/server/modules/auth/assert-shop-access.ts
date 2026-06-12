import type { Actor, ActorMembership } from "./types";

export class ShopAccessError extends Error {
  readonly code: "NOT_AUTHENTICATED" | "FORBIDDEN" | "NOT_MEMBER";

  constructor(code: ShopAccessError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

export function findMembership(actor: Actor, shopId: string): ActorMembership | null {
  return actor.memberships.find((membership) => membership.shopId === shopId) ?? null;
}

export function requireShopMember(actor: Actor, shopId: string): ActorMembership {
  const membership = findMembership(actor, shopId);
  if (!membership) {
    throw new ShopAccessError("NOT_MEMBER", "You are not a member of this shop.");
  }
  return membership;
}

export function requireShopOwner(actor: Actor, shopId: string): ActorMembership {
  const membership = requireShopMember(actor, shopId);
  if (membership.role !== "owner") {
    throw new ShopAccessError("FORBIDDEN", "Only shop owners can perform this action.");
  }
  return membership;
}

export function requireSelfOrOwner(
  actor: Actor,
  shopId: string,
  membershipId: string,
): ActorMembership {
  const membership = requireShopMember(actor, shopId);
  if (membership.role === "owner") {
    return membership;
  }
  if (membership.id !== membershipId) {
    throw new ShopAccessError("FORBIDDEN", "You can only edit your own schedule.");
  }
  return membership;
}
