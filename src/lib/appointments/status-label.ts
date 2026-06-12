type AppointmentStatus = "booked" | "completed" | "no_show" | "cancelled";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Booked",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

export function appointmentStatusLabel(status: AppointmentStatus): string {
  return STATUS_LABELS[status];
}
