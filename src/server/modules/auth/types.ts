import type { Tables } from "@/types/database.types";

export type ActorMembership = {
  id: string;
  role: "owner" | "barber";
  shopId: string;
  shopName: string;
  shopSlug: string;
  shopTimezone: string;
  createdAt: string;
};

export type Actor = {
  userId: string;
  email: string | null;
  profile: Tables<"profiles">;
  memberships: ActorMembership[];
  isPlatformAdmin: boolean;
};

export type ActorState =
  | { kind: "unauthenticated"; redirectTo: "/login" }
  | { kind: "needs_onboarding"; redirectTo: "/onboarding"; actor: Actor }
  | { kind: "has_shop"; redirectTo: "/d"; actor: Actor }
  | { kind: "platform_admin"; redirectTo: "/admin"; actor: Actor };

export type PostAuthRedirect = "/login" | "/onboarding" | "/d" | "/admin";
