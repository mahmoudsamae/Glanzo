import { z } from "zod";

export const serviceNameSchema = z.string().trim().min(2).max(80);

export const serviceDurationSchema = z
  .number()
  .int()
  .positive()
  .max(480)
  .refine((value) => value % 5 === 0, "Duration must be a multiple of 5 minutes");

export const servicePriceCentsSchema = z.number().int().min(0);

export const createServiceInputSchema = z.object({
  name: serviceNameSchema,
  durationMin: serviceDurationSchema,
  priceCents: servicePriceCentsSchema,
  membershipIds: z.array(z.string().uuid()).default([]),
});

export const updateServiceInputSchema = createServiceInputSchema.partial().extend({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;
