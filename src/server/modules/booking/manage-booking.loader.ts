import "server-only";

import { cache } from "react";

import { bookingTokenParamSchema } from "@/lib/validations/booking";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { GetBookingByTokenRpcResult } from "@/types/database-rpc.types";

import {
  getAppointmentSchedulingContextByToken,
  getShopSchedulingContextBySlug,
} from "./booking.queries";
import { getPublicBooking } from "./public-booking.service";

export type ManageBookingView =
  | { kind: "inactive" }
  | {
      kind: "active";
      token: string;
      booking: GetBookingByTokenRpcResult;
      timezone: string;
      shopSlug: string;
      serviceId: string;
      membershipId: string;
    };

export const loadManageBooking = cache(async (token: string): Promise<ManageBookingView> => {
  const parsed = bookingTokenParamSchema.safeParse(token);
  if (!parsed.success) {
    return { kind: "inactive" };
  }

  const bookingResult = await getPublicBooking(parsed.data);
  if (!bookingResult.ok) {
    return { kind: "inactive" };
  }

  const admin = createServiceRoleClient();
  const context = await getAppointmentSchedulingContextByToken(admin, parsed.data);
  if (!context) {
    return { kind: "inactive" };
  }

  const shop = await getShopSchedulingContextBySlug(admin, context.shopSlug);
  if (!shop) {
    return { kind: "inactive" };
  }

  return {
    kind: "active",
    token: parsed.data,
    booking: bookingResult.data,
    timezone: shop.timezone,
    shopSlug: context.shopSlug,
    serviceId: context.serviceId,
    membershipId: context.membershipId,
  };
});
