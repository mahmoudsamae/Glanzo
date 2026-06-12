import type { AppointmentStatus } from "./appointment-status";

export type AppointmentListItem = {
  id: string;
  shopId: string;
  customerId: string | null;
  membershipId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  serviceName: string;
  priceCents: number;
  source: "online" | "walk_in";
  customerName: string | null;
  customerPhone: string | null;
};

export type BarberColumn = {
  membershipId: string;
  displayName: string;
  role: "owner" | "barber";
};

export type DayAppointmentsPayload = {
  date: string;
  timezone: string;
  barbers: BarberColumn[];
  appointments: AppointmentListItem[];
  slotGranularityMin: number;
  openingHours: import("@/lib/validations/shop").OpeningHours;
};

export type TodaySummary = {
  expectedRevenueCents: number;
  appointmentCount: number;
  gapCount: number;
  noShowCount: number;
  appointments: AppointmentListItem[];
};
