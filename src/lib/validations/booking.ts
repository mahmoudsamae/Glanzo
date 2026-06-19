import { z } from "zod";

import { shopSlugSchema } from "@/lib/validations/shop";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const availabilityQuerySchema = z.object({
  serviceId: z.string().uuid(),
  date: isoDateSchema,
  membershipId: z.string().uuid().optional(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export const idempotencyKeyHeaderSchema = z
  .string()
  .min(1)
  .refine(
    (value) => {
      const trimmed = value.trim();
      if (trimmed.length < 16) {
        return false;
      }
      const uuidResult = z.string().uuid().safeParse(trimmed);
      return uuidResult.success || trimmed.length >= 16;
    },
    { message: "Idempotency-Key must be a UUID or at least 16 characters" },
  );

export const createBookingBodySchema = z.object({
  serviceId: z.string().uuid(),
  membershipId: z.string().uuid().nullable().optional(),
  startsAt: isoDateTimeSchema,
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(1).max(20),
  email: z.string().trim().email().nullable().optional(),
});

export type CreateBookingBody = z.infer<typeof createBookingBodySchema>;

export const duplicateBookingQuerySchema = z.object({
  phone: z.string().trim().min(1).max(20),
  name: z.string().trim().min(2).max(80),
  startsAt: isoDateTimeSchema,
});

export type DuplicateBookingQuery = z.infer<typeof duplicateBookingQuerySchema>;

export const rescheduleBookingBodySchema = z.object({
  startsAt: isoDateTimeSchema,
});

export type RescheduleBookingBody = z.infer<typeof rescheduleBookingBodySchema>;

export const bookingTokenParamSchema = z
  .string()
  .min(32, "manage token must be at least 32 characters");

export const publicShopSlugParamSchema = shopSlugSchema;
