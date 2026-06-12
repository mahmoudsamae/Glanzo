import { NextResponse } from "next/server";

import {
  bookingErrorMessage,
  type BookingErrorCode,
} from "@/lib/booking/errors";
import { bookingHttpStatus } from "@/lib/booking/http-status";

export type PublicApiAlternativeSlot = {
  membershipId: string;
  startsAt: string;
  endsAt: string;
};

export type PublicApiErrorBody = {
  code: BookingErrorCode;
  message: string;
  alternatives?: PublicApiAlternativeSlot[];
};

export type PublicApiSuccess<T> = { data: T };

export type PublicApiFailure = { error: PublicApiErrorBody };

export type PublicApiEnvelope<T> = PublicApiSuccess<T> | PublicApiFailure;

export function publicJson<T>(
  body: PublicApiEnvelope<T>,
  init?: { status?: number; headers?: HeadersInit },
): NextResponse {
  const status =
    init?.status ??
    ("error" in body ? bookingHttpStatus(body.error.code) : 200);

  return NextResponse.json(body, {
    status,
    headers: init?.headers,
  });
}

export function publicData<T>(
  data: T,
  init?: { status?: number; headers?: HeadersInit },
): NextResponse {
  return publicJson({ data }, init);
}

export function publicError(
  code: BookingErrorCode,
  init?: {
    status?: number;
    headers?: HeadersInit;
    alternatives?: PublicApiAlternativeSlot[];
  },
): NextResponse {
  const error: PublicApiErrorBody = {
    code,
    message: bookingErrorMessage(code),
  };
  if (init?.alternatives && init.alternatives.length > 0) {
    error.alternatives = init.alternatives;
  }
  return publicJson({ error }, init);
}

export const AVAILABILITY_CACHE_CONTROL = "public, max-age=30";
export const BOOKING_CACHE_CONTROL = "no-store";
