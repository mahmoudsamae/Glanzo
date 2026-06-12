"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCustomerProfileAction, fetchCustomersListAction } from "../api";
import { customerProfileKey, customersListKey } from "../keys";

export function useCustomersListQuery(shopId: string, search?: string, cursor?: string) {
  return useQuery({
    queryKey: customersListKey(shopId, { search, cursor }),
    queryFn: async () => {
      const result = await fetchCustomersListAction({ search, cursor });
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result.data;
    },
  });
}

export function useCustomerProfileQuery(shopId: string, customerId: string) {
  return useQuery({
    queryKey: customerProfileKey(shopId, customerId),
    queryFn: async () => {
      const result = await fetchCustomerProfileAction(customerId);
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result.data;
    },
  });
}
