import "server-only";

import { normalizePhoneToE164 } from "@/lib/phone/normalize-e164";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DeleteCustomerInput,
  UpdateCustomerNotesInput,
  UpsertCustomerInput,
} from "@/lib/validations/customer";
import {
  requireShopMember,
  requireShopOwner,
  ShopAccessError,
} from "@/server/modules/auth/assert-shop-access";
import type { Actor } from "@/server/modules/auth/types";

import { getCustomerById, listCustomersPage } from "./customers.queries";
import type { CustomerListPage, CustomerProfile } from "./customers.types";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" };

function mapError(error: unknown): ServiceResult<never> {
  if (error instanceof ShopAccessError) {
    return { ok: false, code: "FORBIDDEN" };
  }
  return { ok: false, code: "NOT_FOUND" };
}

export async function fetchCustomersList(
  actor: Actor,
  shopId: string,
  input: { search?: string; cursor?: string; limit?: number },
): Promise<ServiceResult<CustomerListPage>> {
  try {
    requireShopMember(actor, shopId);
  } catch (error) {
    return mapError(error);
  }

  const limit = input.limit ?? 50;
  const supabase = await createServerSupabaseClient();
  const customers = await listCustomersPage(supabase, shopId, {
    search: input.search,
    cursor: input.cursor,
    limit: limit + 1,
  });

  const hasMore = customers.length > limit;
  const page = hasMore ? customers.slice(0, limit) : customers;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  return { ok: true, data: { customers: page, nextCursor } };
}

export async function fetchCustomerProfile(
  actor: Actor,
  shopId: string,
  customerId: string,
): Promise<ServiceResult<CustomerProfile>> {
  try {
    requireShopMember(actor, shopId);
  } catch (error) {
    return mapError(error);
  }

  const supabase = await createServerSupabaseClient();
  const profile = await getCustomerById(supabase, shopId, customerId);
  if (!profile) {
    return { ok: false, code: "NOT_FOUND" };
  }
  return { ok: true, data: profile };
}

export async function updateCustomerNotes(
  actor: Actor,
  shopId: string,
  input: UpdateCustomerNotesInput,
): Promise<ServiceResult<{ id: string }>> {
  try {
    requireShopMember(actor, shopId);
  } catch (error) {
    return mapError(error);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .update({ notes: input.notes })
    .eq("shop_id", shopId)
    .eq("id", input.customerId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, code: "NOT_FOUND" };
  }
  return { ok: true, data: { id: data.id } };
}

export async function createManualCustomer(
  actor: Actor,
  shopId: string,
  input: UpsertCustomerInput,
): Promise<ServiceResult<{ id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch (error) {
    return mapError(error);
  }

  const phone = normalizePhoneToE164(input.phone);
  if (!phone) {
    return { ok: false, code: "VALIDATION" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      {
        shop_id: shopId,
        name: input.name,
        phone,
        email: input.email ?? null,
      },
      { onConflict: "shop_id,phone" },
    )
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, code: "VALIDATION" };
  }
  return { ok: true, data: { id: data.id } };
}

export async function deleteCustomer(
  actor: Actor,
  shopId: string,
  input: DeleteCustomerInput,
): Promise<ServiceResult<{ id: string }>> {
  try {
    requireShopOwner(actor, shopId);
  } catch (error) {
    return mapError(error);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("shop_id", shopId)
    .eq("id", input.customerId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, code: "NOT_FOUND" };
  }
  return { ok: true, data: { id: data.id } };
}
