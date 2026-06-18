import { NICOLES_SALON_KIT } from "./nicoles-salon";
import { PREMIUM_ATELIER_KIT } from "./premium-atelier";
import type { StarterKitDefinition } from "./types";

export const STARTER_KITS: StarterKitDefinition[] = [NICOLES_SALON_KIT, PREMIUM_ATELIER_KIT];

export function getStarterKit(id: string): StarterKitDefinition | undefined {
  return STARTER_KITS.find((kit) => kit.id === id);
}
