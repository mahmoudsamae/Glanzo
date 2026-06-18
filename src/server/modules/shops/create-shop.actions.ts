"use server";

import type { CheckSlugResult, CreateShopResult } from "@/lib/auth/types";
import type { CreateShopInput } from "@/lib/validations/shop";

import {
  checkShopSlugAvailability as checkShopSlugAvailabilityImpl,
  createShop as createShopImpl,
  createShopAndRedirect as createShopAndRedirectImpl,
} from "./create-shop.service";

export async function checkShopSlugAvailability(slug: string): Promise<CheckSlugResult> {
  return checkShopSlugAvailabilityImpl(slug);
}

export async function createShop(input: CreateShopInput): Promise<CreateShopResult> {
  return createShopImpl(input);
}

export async function createShopAndRedirect(input: CreateShopInput): Promise<CreateShopResult> {
  return createShopAndRedirectImpl(input);
}
