import type { Database } from "@/types/database.types";

export type OutboxRow = Database["public"]["Tables"]["notification_outbox"]["Row"];
export type NotificationTemplate = Database["public"]["Enums"]["notification_template"];

export type OutboxPayload = {
  to?: string;
  appointment_id?: string;
  provider_message_id?: string;
};
