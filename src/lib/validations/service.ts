import { z } from "zod";

export const serviceNameSchema = z.string().trim().min(2).max(80);

export const serviceDurationSchema = z
  .number()
  .int()
  .positive()
  .max(480)
  .refine((value) => value % 5 === 0, "Duration must be a multiple of 5 minutes");

export const servicePriceCentsSchema = z.number().int().min(0);

export const serviceDescriptionSchema = z.string().trim().max(240).optional().nullable();

export const serviceImagePathSchema = z.string().trim().min(1).optional().nullable();

const serviceInputBase = z.object({
  name: serviceNameSchema,
  durationMin: serviceDurationSchema,
  priceCents: servicePriceCentsSchema.optional(),
  showPrice: z.boolean().default(true),
  description: serviceDescriptionSchema,
  imagePath: serviceImagePathSchema,
  membershipIds: z.array(z.string().uuid()).default([]),
});

function refineServicePricing<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine(
    (data: { showPrice?: boolean; priceCents?: number; description?: string | null }, ctx) => {
      if (data.showPrice && data.priceCents === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price is required when showing price on the website",
          path: ["priceCents"],
        });
      }
      if (!data.showPrice && !data.description?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add a short description when hiding the price",
          path: ["description"],
        });
      }
    },
  );
}

export const createServiceInputSchema = refineServicePricing(serviceInputBase);

export const updateServiceInputSchema = refineServicePricing(
  serviceInputBase.partial().extend({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0).optional(),
  }),
);

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;
