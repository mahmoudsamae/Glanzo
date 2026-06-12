import { getClientIpFromRequest } from "@/lib/api/client-ip";
import {
  BOOKING_CACHE_CONTROL,
  publicData,
  publicError,
} from "@/lib/api/public-response";
import {
  createBookingBodySchema,
  idempotencyKeyHeaderSchema,
  publicShopSlugParamSchema,
} from "@/lib/validations/booking";
import { bookPublicAppointment } from "@/server/modules/booking/public-booking.service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const slugParsed = publicShopSlugParamSchema.safeParse(slug);
  if (!slugParsed.success) {
    return publicError("INVALID_INPUT", { status: 404 });
  }

  const idempotencyHeader = request.headers.get("Idempotency-Key");
  const idempotencyParsed = idempotencyKeyHeaderSchema.safeParse(idempotencyHeader ?? "");
  if (!idempotencyParsed.success) {
    return publicError("INVALID_INPUT");
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return publicError("INVALID_INPUT");
  }

  const bodyParsed = createBookingBodySchema.safeParse(json);
  if (!bodyParsed.success) {
    return publicError("INVALID_INPUT");
  }

  const result = await bookPublicAppointment({
    slug: slugParsed.data,
    body: bodyParsed.data,
    idempotencyKey: idempotencyParsed.data.trim(),
    clientIp: getClientIpFromRequest(request),
  });

  if (!result.ok) {
    return publicError(result.code, {
      alternatives: result.alternatives,
      headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
    });
  }

  return publicData(result.data, {
    status: result.data.idempotentReplay ? 200 : 201,
    headers: { "Cache-Control": BOOKING_CACHE_CONTROL },
  });
}
