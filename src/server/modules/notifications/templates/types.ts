import type { NotificationTemplate } from "@/lib/notifications/types";

export type NotificationRenderContext = {
  shopName: string;
  shopSlug: string;
  shopTimezone: string;
  shopAddress?: string;
  customerName: string;
  serviceName: string;
  barberName: string;
  priceFormatted: string;
  weekdayDate: string;
  timeLabel: string;
  oneLineWhen: string;
  manageUrl: string;
  minisiteUrl: string;
  calendarUrl: string;
  sourceLabel: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

export type TemplateRenderer = (ctx: NotificationRenderContext) => RenderedEmail;

export type TemplateMap = Record<NotificationTemplate, TemplateRenderer>;
