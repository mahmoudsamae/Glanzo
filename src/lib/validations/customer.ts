import { z } from "zod";

export const customerSearchSchema = z.object({
  q: z.string().trim().max(80).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(50),
});

export const upsertCustomerInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(1).max(20),
  email: z.string().trim().email().nullable().optional(),
});

export const updateCustomerNotesSchema = z.object({
  customerId: z.string().uuid(),
  notes: z.string().max(2000),
});

export const deleteCustomerSchema = z.object({
  customerId: z.string().uuid(),
});

export type UpsertCustomerInput = z.infer<typeof upsertCustomerInputSchema>;
export type UpdateCustomerNotesInput = z.infer<typeof updateCustomerNotesSchema>;
export type DeleteCustomerInput = z.infer<typeof deleteCustomerSchema>;
