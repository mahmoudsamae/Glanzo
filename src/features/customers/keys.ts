import { shopQueryKey } from "@/lib/query/keys";

export function customersListKey(shopId: string, params?: { search?: string; cursor?: string }) {
  return shopQueryKey(shopId, "customers", params ?? {});
}

export function customerProfileKey(shopId: string, customerId: string) {
  return shopQueryKey(shopId, "customer", { customerId });
}
