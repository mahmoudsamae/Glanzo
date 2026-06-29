import { FORGE_BARBERSHOP_KIT } from "./forge-barbershop";
import { MECCA_NOIR_KIT } from "./mecca-noir";
import { NICOLES_SALON_KIT } from "./nicoles-salon";
import { PREMIUM_ATELIER_KIT } from "./premium-atelier";
import { VELVET_ATELIER_KIT } from "./velvet-atelier";
import type { StarterKitDefinition } from "./types";

export const STARTER_KITS: StarterKitDefinition[] = [
  FORGE_BARBERSHOP_KIT,
  NICOLES_SALON_KIT,
  PREMIUM_ATELIER_KIT,
  MECCA_NOIR_KIT,
  VELVET_ATELIER_KIT,
];

export function getStarterKit(id: string): StarterKitDefinition | undefined {
  return STARTER_KITS.find((kit) => kit.id === id);
}
