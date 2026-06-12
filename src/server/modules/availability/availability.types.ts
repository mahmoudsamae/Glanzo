import type { OpeningHours } from "@/lib/validations/shop";

export type StaffHourRow = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type TimeOffBlock = {
  startsAt: Date;
  endsAt: Date;
};

export type AppointmentBlock = {
  membershipId: string;
  startsAt: Date;
  endsAt: Date;
  status: "booked" | "completed" | "no_show" | "cancelled";
};

export type BarberAvailabilityInput = {
  membershipId: string;
  staffHours: StaffHourRow[];
  timeOff: TimeOffBlock[];
  appointments: AppointmentBlock[];
};

export type ComputeAvailabilityInput = {
  timezone: string;
  /** Calendar date in the shop timezone (YYYY-MM-DD). */
  date: string;
  serviceDurationMin: number;
  bookingLeadTimeMin: number;
  slotGranularityMin: number;
  openingHours: OpeningHours;
  now: Date;
  barbers: BarberAvailabilityInput[];
  /** When set, only slots for this barber are returned. */
  membershipId?: string | null;
};

export type AvailabilitySlot = {
  membershipId: string;
  startsAt: Date;
  endsAt: Date;
};

export type MsInterval = {
  startMs: number;
  endMs: number;
};
