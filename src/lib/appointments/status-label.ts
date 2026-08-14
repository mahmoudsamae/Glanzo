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

export function appointmentStatusActionMessage(code: string): string {
  switch (code) {
    case "TOO_EARLY":
      return "Der Termin hat noch nicht begonnen.";
    case "INVALID_TRANSITION":
      return "Dieser Statuswechsel ist nicht möglich.";
    case "FORBIDDEN":
      return "Keine Berechtigung für diese Aktion.";
    default:
      return "Status konnte nicht aktualisiert werden.";
  }
}
