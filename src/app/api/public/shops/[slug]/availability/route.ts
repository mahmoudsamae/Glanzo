import {
  AVAILABILITY_CACHE_CONTROL,
  publicData,
  publicError,
} from "@/lib/api/public-response";
import { availabilityQuerySchema, publicShopSlugParamSchema } from "@/lib/validations/booking";
import { fetchAvailabilityForShop } from "@/server/modules/booking/availability-io.service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const slugParsed = publicShopSlugParamSchema.safeParse(slug);
  if (!slugParsed.success) {
    return publicError("INVALID_INPUT", { status: 404 });
  }

  const url = new URL(request.url);
  const queryParsed = availabilityQuerySchema.safeParse({
    serviceId: url.searchParams.get("serviceId"),
    date: url.searchParams.get("date"),
    membershipId: url.searchParams.get("membershipId") ?? undefined,
  });

  if (!queryParsed.success) {
    return publicError("INVALID_INPUT");
  }

  const result = await fetchAvailabilityForShop({
    slug: slugParsed.data,
    serviceId: queryParsed.data.serviceId,
    date: queryParsed.data.date,
    membershipId: queryParsed.data.membershipId,
  });

  if (!result.ok) {
    if (result.code === "SHOP_NOT_FOUND") {
      return publicError("INVALID_INPUT", { status: 404 });
    }
    if (result.code === "SHOP_SUSPENDED") {
      return publicError("SHOP_SUSPENDED");
    }
    return publicError("INVALID_INPUT");
  }

  return publicData(
    { slots: result.slots },
    { headers: { "Cache-Control": AVAILABILITY_CACHE_CONTROL } },
  );
}
