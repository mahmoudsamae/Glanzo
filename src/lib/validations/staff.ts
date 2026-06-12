import { z } from "zod";

import { assertNoOverlappingShifts, type StaffShiftInput } from "@/lib/staff/hours-overlap";
import { STAFF_WEEKDAY_ORDER } from "@/lib/staff/weekday";

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const staffShiftSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((shift) => shift.endTime > shift.startTime, {
    message: "End time must be after start time",
  });

export const staffDayHoursSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    shifts: z.array(staffShiftSchema),
  })
  .superRefine((day, ctx) => {
    const message = assertNoOverlappingShifts(day.shifts as StaffShiftInput[]);
    if (message) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    }
  });

export const staffWeeklyHoursSchema = z.object({
  days: z.array(staffDayHoursSchema),
});

export const timeOffInputSchema = z
  .object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    note: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "End must be after start",
  });

export const createStaffInviteInputSchema = z.object({
  email: z.string().email(),
});

export type StaffShift = z.infer<typeof staffShiftSchema>;
export type StaffDayHours = z.infer<typeof staffDayHoursSchema>;
export type TimeOffInput = z.infer<typeof timeOffInputSchema>;

export const STAFF_WEEKDAY_KEYS = STAFF_WEEKDAY_ORDER;
