import {
  BOOKING_CACHE_CONTROL,
  publicData,
  publicError,
} from "@/lib/api/public-response";
import { normalizeBookingSlotParam } from "@/lib/booking/booking-steps";
import {
  duplicateBookingQuerySchema,
  publicShopSlugParamSchema,
} from "@/lib/validations/booking";
import { checkDuplicateCustomerBooking } from "@/server/modules/booking/public-booking.service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const slugParsed = publicShopSlugParamSchema.safeParse(slug);
  if (!slugParsed.success) {
    return publicError("INVALID_INPUT", { status: 404 });
  }

  const url = new URL(request.url);
  const queryParsed = duplicateBookingQuerySchema.safeParse({
    phone: url.searchParams.get("phone") ?? "",
    name: url.searchParams.get("name") ?? "",
    startsAt: normalizeBookingSlotParam(url.searchParams.get("startsAt")) ?? "",
  });

  if (!queryParsed.success) {
    return publicError("INVALID_INPUT");
  }

  const result = await checkDuplicateCustomerBooking({
    slug: slugParsed.data,
    phone: queryParsed.data.phone,
    name: queryParsed.data.name,
    startsAt: queryParsed.data.startsAt,
  });

  if (!result.ok) {
    return publicError(result.code, {
      headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
    });
  }

  return publicData(result.data, {
    headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
  });
}
