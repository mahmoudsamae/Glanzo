import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const walkInAppointmentInputSchema = z
  .object({
    serviceId: z.string().uuid(),
    membershipId: z.string().uuid(),
    startsAt: isoDateTimeSchema,
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(1).max(20).optional(),
  })
  .superRefine((value, ctx) => {
    const hasName = Boolean(value.name);
    const hasPhone = Boolean(value.phone);
    if (hasName !== hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "name and phone must be provided together",
        path: ["phone"],
      });
    }
  });

export type WalkInAppointmentInput = z.infer<typeof walkInAppointmentInputSchema>;

export const updateAppointmentStatusInputSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(["completed", "no_show", "cancelled"]),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusInputSchema>;

export const moveAppointmentInputSchema = z.object({
  appointmentId: z.string().uuid(),
  startsAt: isoDateTimeSchema,
  membershipId: z.string().uuid().optional(),
});

export type MoveAppointmentInput = z.infer<typeof moveAppointmentInputSchema>;
