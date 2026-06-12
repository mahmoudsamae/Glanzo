import type { AppointmentStatus } from "@/server/modules/appointments/appointment-status";

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string;
  visitsCount: number;
  lastVisitAt: string | null;
};

export type CustomerVisitRow = {
  id: string;
  startsAt: string;
  serviceName: string;
  barberName: string;
  priceCents: number;
  status: AppointmentStatus;
};

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  visitsCount: number;
  noShowCount: number;
  totalSpentCents: number;
  visits: CustomerVisitRow[];
};

export type CustomerListPage = {
  customers: CustomerListItem[];
  nextCursor: string | null;
};
