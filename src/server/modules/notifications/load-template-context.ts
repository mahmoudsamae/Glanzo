import "server-only";

import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";
import { formatPriceCents } from "@/lib/minisite/format-price";
import {
  calendarDateParam,
  formatEmailOneLineSummary,
  formatEmailTime,
  formatEmailWeekdayDate,
} from "@/lib/notifications/format-email-datetime";
import { siteOrigin } from "@/lib/site-origin";
import { createServiceRoleClient } from "@/lib/supabase/service";

import type { NotificationRenderContext } from "./templates/types";

const SOURCE_LABELS: Record<string, string> = {
  online: "Online",
  walk_in: "Walk-in",
};

export async function loadNotificationRenderContext(
  shopId: string,
  appointmentId: string,
): Promise<NotificationRenderContext | null> {
  const supabase = createServiceRoleClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      starts_at,
      source,
      manage_token,
      service_name,
      price_cents,
      shop:shops!inner ( name, slug, timezone, reminders_enabled ),
      customer:customers!inner ( name, email ),
      membership:memberships!inner (
        profiles!inner ( display_name )
      )
    `,
    )
    .eq("shop_id", shopId)
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !appointment) {
    return null;
  }

  const shop = appointment.shop as {
    name: string;
    slug: string;
    timezone: string;
    reminders_enabled: boolean;
  };
  const customer = appointment.customer as { name: string; email: string | null };
  const membership = appointment.membership as {
    profiles: { display_name: string };
  };

  const { data: minisite } = await supabase
    .from("minisite")
    .select("content")
    .eq("shop_id", shopId)
    .maybeSingle();

  const content = (minisite?.content ?? {}) as { address?: string };
  const origin = siteOrigin();
  const manageUrl = `${origin}/bookings/${appointment.manage_token}`;
  const minisiteUrl = buildShopMinisiteUrl(shop.slug);
  const calendarUrl = `${origin}/d/calendar?date=${calendarDateParam(appointment.starts_at, shop.timezone)}`;

  return {
    shopName: shop.name,
    shopSlug: shop.slug,
    shopTimezone: shop.timezone,
    shopAddress: content.address?.trim() || undefined,
    customerName: customer.name,
    serviceName: appointment.service_name,
    barberName: membership.profiles.display_name,
    priceFormatted: formatPriceCents(appointment.price_cents),
    weekdayDate: formatEmailWeekdayDate(appointment.starts_at, shop.timezone),
    timeLabel: formatEmailTime(appointment.starts_at, shop.timezone),
    oneLineWhen: formatEmailOneLineSummary(appointment.starts_at, shop.timezone),
    manageUrl,
    minisiteUrl,
    calendarUrl,
    sourceLabel: SOURCE_LABELS[appointment.source] ?? appointment.source,
  };
}

export async function loadShopRemindersEnabled(shopId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("shops").select("reminders_enabled").eq("id", shopId).single();
  return data?.reminders_enabled ?? true;
}

export async function loadAppointmentStatus(
  shopId: string,
  appointmentId: string,
): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("appointments")
    .select("status")
    .eq("shop_id", shopId)
    .eq("id", appointmentId)
    .maybeSingle();
  return data?.status ?? null;
}
