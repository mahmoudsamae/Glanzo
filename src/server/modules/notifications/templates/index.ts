import type { NotificationTemplate } from "@/lib/notifications/types";

import { renderBookingCancelled } from "./booking-cancelled";
import { renderBookingConfirmed } from "./booking-confirmed";
import { renderOwnerNewBooking } from "./owner-new-booking";
import { renderReminder24h } from "./reminder-24h";
import type { NotificationRenderContext, RenderedEmail, TemplateRenderer } from "./types";

const RENDERERS: Record<NotificationTemplate, TemplateRenderer> = {
  booking_confirmed: renderBookingConfirmed,
  reminder_24h: renderReminder24h,
  booking_cancelled: renderBookingCancelled,
  owner_new_booking: renderOwnerNewBooking,
};

export function renderNotificationTemplate(
  template: NotificationTemplate,
  context: NotificationRenderContext,
): RenderedEmail {
  return RENDERERS[template](context);
}

export type { NotificationRenderContext, RenderedEmail };
export { DUMMY_NOTIFICATION_CONTEXT } from "./dummy-data";
