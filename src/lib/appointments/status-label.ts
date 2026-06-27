type AppointmentStatus = "booked" | "completed" | "no_show" | "cancelled";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Gebucht",
  completed: "Abgeschlossen",
  no_show: "Nicht erschienen",
  cancelled: "Storniert",
};

export function appointmentStatusLabel(status: AppointmentStatus): string {
  return STATUS_LABELS[status];
}
