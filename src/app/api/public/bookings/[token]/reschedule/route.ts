import {
  BOOKING_CACHE_CONTROL,
  publicData,
  publicError,
} from "@/lib/api/public-response";
import {
  bookingTokenParamSchema,
  rescheduleBookingBodySchema,
} from "@/lib/validations/booking";
import { reschedulePublicBooking } from "@/server/modules/booking/public-booking.service";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const tokenParsed = bookingTokenParamSchema.safeParse(token);
  if (!tokenParsed.success) {
    return publicError("BOOKING_NOT_FOUND");
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return publicError("INVALID_INPUT");
  }

  const bodyParsed = rescheduleBookingBodySchema.safeParse(json);
  if (!bodyParsed.success) {
    return publicError("INVALID_INPUT");
  }

  const result = await reschedulePublicBooking({
    token: tokenParsed.data,
    startsAt: bodyParsed.data.startsAt,
  });

  if (!result.ok) {
    return publicError(result.code, {
      alternatives: result.alternatives,
      headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
    });
  }

  return publicData(result.data, {
    headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
  });
}
