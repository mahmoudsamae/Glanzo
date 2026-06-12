import {
  BOOKING_CACHE_CONTROL,
  publicData,
  publicError,
} from "@/lib/api/public-response";
import { bookingTokenParamSchema } from "@/lib/validations/booking";
import { getPublicBooking } from "@/server/modules/booking/public-booking.service";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const tokenParsed = bookingTokenParamSchema.safeParse(token);
  if (!tokenParsed.success) {
    return publicError("BOOKING_NOT_FOUND");
  }

  const result = await getPublicBooking(tokenParsed.data);
  if (!result.ok) {
    return publicError(result.code, {
      headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
    });
  }

  return publicData(result.data, {
    headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
  });
}
