export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          actor_type: Database["public"]["Enums"]["actor_type"];
          created_at: string;
          diff: Json | null;
          entity: string;
          entity_id: string | null;
          id: string;
          ip: string | null;
          shop_id: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          actor_type: Database["public"]["Enums"]["actor_type"];
          created_at?: string;
          diff?: Json | null;
          entity: string;
          entity_id?: string | null;
          id?: string;
          ip?: string | null;
          shop_id?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          actor_type?: Database["public"]["Enums"]["actor_type"];
          created_at?: string;
          diff?: Json | null;
          entity?: string;
          entity_id?: string | null;
          id?: string;
          ip?: string | null;
          shop_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          customer_id: string | null;
          ends_at: string;
          id: string;
          manage_token: string;
          membership_id: string;
          price_cents: number;
          service_id: string;
          service_name: string;
          shop_id: string;
          source: Database["public"]["Enums"]["appointment_source"];
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          customer_id?: string | null;
          ends_at: string;
          id?: string;
          manage_token: string;
          membership_id: string;
          price_cents: number;
          service_id: string;
          service_name: string;
          shop_id: string;
          source: Database["public"]["Enums"]["appointment_source"];
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          customer_id?: string | null;
          ends_at?: string;
          id?: string;
          manage_token?: string;
          membership_id?: string;
          price_cents?: number;
          service_id?: string;
          service_name?: string;
          shop_id?: string;
          source?: Database["public"]["Enums"]["appointment_source"];
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_customer_fk";
            columns: ["shop_id", "customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["shop_id", "id"];
          },
          {
            foreignKeyName: "appointments_membership_fk";
            columns: ["shop_id", "membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["shop_id", "id"];
          },
          {
            foreignKeyName: "appointments_service_fk";
            columns: ["shop_id", "service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["shop_id", "id"];
          },
          {
            foreignKeyName: "appointments_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_attempts: {
        Row: {
          attempted_at: string;
          id: string;
          ip: string;
          shop_id: string;
        };
        Insert: {
          attempted_at?: string;
          id?: string;
          ip: string;
          shop_id: string;
        };
        Update: {
          attempted_at?: string;
          id?: string;
          ip?: string;
          shop_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_attempts_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_requests: {
        Row: {
          appointment_id: string;
          created_at: string;
          idempotency_key: string;
          shop_id: string;
        };
        Insert: {
          appointment_id: string;
          created_at?: string;
          idempotency_key: string;
          shop_id: string;
        };
        Update: {
          appointment_id?: string;
          created_at?: string;
          idempotency_key?: string;
          shop_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_requests_appointment_fk";
            columns: ["shop_id", "appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["shop_id", "id"];
          },
          {
            foreignKeyName: "booking_requests_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone: string;
          shop_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone: string;
          shop_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string;
          shop_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      memberships: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["membership_role"];
          shop_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["membership_role"];
          shop_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["membership_role"];
          shop_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      minisite: {
        Row: {
          accent_hex: string;
          content: Json;
          created_at: string;
          shop_id: string;
          template: Database["public"]["Enums"]["minisite_template"];
          updated_at: string;
        };
        Insert: {
          accent_hex?: string;
          content?: Json;
          created_at?: string;
          shop_id: string;
          template?: Database["public"]["Enums"]["minisite_template"];
          updated_at?: string;
        };
        Update: {
          accent_hex?: string;
          content?: Json;
          created_at?: string;
          shop_id?: string;
          template?: Database["public"]["Enums"]["minisite_template"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "minisite_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: true;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_outbox: {
        Row: {
          appointment_id: string;
          attempts: number;
          channel: Database["public"]["Enums"]["notification_channel"];
          claimed_at: string | null;
          created_at: string;
          id: string;
          last_error: string | null;
          payload: Json;
          scheduled_for: string;
          shop_id: string;
          status: Database["public"]["Enums"]["outbox_status"];
          template: Database["public"]["Enums"]["notification_template"];
          updated_at: string;
        };
        Insert: {
          appointment_id: string;
          attempts?: number;
          channel: Database["public"]["Enums"]["notification_channel"];
          claimed_at?: string | null;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          payload?: Json;
          scheduled_for: string;
          shop_id: string;
          status?: Database["public"]["Enums"]["outbox_status"];
          template: Database["public"]["Enums"]["notification_template"];
          updated_at?: string;
        };
        Update: {
          appointment_id?: string;
          attempts?: number;
          channel?: Database["public"]["Enums"]["notification_channel"];
          claimed_at?: string | null;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          payload?: Json;
          scheduled_for?: string;
          shop_id?: string;
          status?: Database["public"]["Enums"]["outbox_status"];
          template?: Database["public"]["Enums"]["notification_template"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_outbox_appointment_fk";
            columns: ["shop_id", "appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["shop_id", "id"];
          },
          {
            foreignKeyName: "notification_outbox_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "platform_admins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shops: {
        Row: {
          allowed_minisite_templates: Database["public"]["Enums"]["minisite_template"][];
          booking_auto_assign_barber: boolean;
          booking_lead_time_min: number;
          cancellation_window_min: number;
          created_at: string;
          currency: string;
          id: string;
          name: string;
          opening_hours: Json;
          reminders_enabled: boolean;
          slug: string;
          slot_granularity_min: number;
          status: Database["public"]["Enums"]["shop_status"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          allowed_minisite_templates?: Database["public"]["Enums"]["minisite_template"][];
          booking_auto_assign_barber?: boolean;
          booking_lead_time_min?: number;
          cancellation_window_min?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          name: string;
          opening_hours?: Json;
          reminders_enabled?: boolean;
          slug: string;
          slot_granularity_min?: number;
          status?: Database["public"]["Enums"]["shop_status"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          allowed_minisite_templates?: Database["public"]["Enums"]["minisite_template"][];
          booking_auto_assign_barber?: boolean;
          booking_lead_time_min?: number;
          cancellation_window_min?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          name?: string;
          opening_hours?: Json;
          reminders_enabled?: boolean;
          slug?: string;
          slot_granularity_min?: number;
          status?: Database["public"]["Enums"]["shop_status"];
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_staff: {
        Row: {
          created_at: string;
          membership_id: string;
          service_id: string;
          shop_id: string;
        };
        Insert: {
          created_at?: string;
          membership_id: string;
          service_id: string;
          shop_id: string;
        };
        Update: {
          created_at?: string;
          membership_id?: string;
          service_id?: string;
          shop_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_staff_membership_fk";
            columns: ["shop_id", "membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["shop_id", "id"];
          },
          {
            foreignKeyName: "service_staff_service_fk";
            columns: ["shop_id", "service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["shop_id", "id"];
          },
        ];
      };
      services: {
        Row: {
          archived_at: string | null;
          created_at: string;
          duration_min: number;
          id: string;
          name: string;
          price_cents: number;
          shop_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          duration_min: number;
          id?: string;
          name: string;
          price_cents: number;
          shop_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          duration_min?: number;
          id?: string;
          name?: string;
          price_cents?: number;
          shop_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_hours: {
        Row: {
          created_at: string;
          end_time: string;
          id: string;
          membership_id: string;
          shop_id: string;
          start_time: string;
          updated_at: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          end_time: string;
          id?: string;
          membership_id: string;
          shop_id: string;
          start_time: string;
          updated_at?: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          end_time?: string;
          id?: string;
          membership_id?: string;
          shop_id?: string;
          start_time?: string;
          updated_at?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "staff_hours_membership_fk";
            columns: ["shop_id", "membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["shop_id", "id"];
          },
        ];
      };
      staff_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          created_by: string | null;
          email: string;
          expires_at: string;
          id: string;
          role: Database["public"]["Enums"]["membership_role"];
          shop_id: string;
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          email: string;
          expires_at: string;
          id?: string;
          role?: Database["public"]["Enums"]["membership_role"];
          shop_id: string;
          token: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string;
          expires_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["membership_role"];
          shop_id?: string;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_invites_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      time_off: {
        Row: {
          created_at: string;
          ends_at: string;
          id: string;
          membership_id: string;
          note: string | null;
          shop_id: string;
          starts_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at: string;
          id?: string;
          membership_id: string;
          note?: string | null;
          shop_id: string;
          starts_at: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string;
          id?: string;
          membership_id?: string;
          note?: string | null;
          shop_id?: string;
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_off_membership_fk";
            columns: ["shop_id", "membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["shop_id", "id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_staff_invite: {
        Args: { p_token: string };
        Returns: Database["public"]["Tables"]["memberships"]["Row"];
      };
      book_appointment: {
        Args: {
          p_shop_slug: string;
          p_service_id: string;
          p_membership_id: string | null;
          p_starts_at: string;
          p_name: string;
          p_phone: string;
          p_email: string | null;
          p_idempotency_key: string;
          p_client_ip?: string | null;
        };
        Returns: Json;
      };
      cancel_booking_by_token: {
        Args: { p_token: string };
        Returns: Json;
      };
      get_booking_by_token: {
        Args: { p_token: string };
        Returns: Json;
      };
      reschedule_booking_by_token: {
        Args: { p_token: string; p_new_starts_at: string };
        Returns: Json;
      };
      create_shop_with_owner: {
        Args: {
          p_name: string;
          p_opening_hours: Json;
          p_slug: string;
          p_timezone: string;
        };
        Returns: Database["public"]["Tables"]["shops"]["Row"];
      };
      get_shop_public_data: {
        Args: { p_slug: string };
        Returns: Json;
      };
      is_platform_admin: { Args: Record<string, never>; Returns: boolean };
      is_valid_e164_phone: { Args: { p_phone: string }; Returns: boolean };
      is_shop_owner: { Args: { p_shop_id: string }; Returns: boolean };
      shop_media_path_owned: { Args: { p_name: string }; Returns: boolean };
      is_shop_slug_available: { Args: { p_slug: string }; Returns: boolean };
      is_shop_slug_reserved: { Args: { p_slug: string }; Returns: boolean };
      claim_outbox_batch: {
        Args: { p_limit: number };
        Returns: Database["public"]["Tables"]["notification_outbox"]["Row"][];
      };
      platform_create_owner_invite: {
        Args: { p_owner_email: string; p_shop_id: string };
        Returns: Json;
      };
      platform_create_shop: {
        Args: {
          p_name: string;
          p_owner_email: string;
          p_slug: string;
          p_timezone: string;
        };
        Returns: Json;
      };
      platform_get_overview: { Args: Record<string, never>; Returns: Json };
      platform_get_shop: { Args: { p_shop_id: string }; Returns: Json };
      platform_get_shop_today: { Args: { p_shop_id: string }; Returns: Json };
      platform_list_shops: {
        Args: {
          p_cursor?: string | null;
          p_search?: string | null;
          p_status?: string | null;
        };
        Returns: Json;
      };
      platform_record_support_view: { Args: { p_shop_id: string }; Returns: undefined };
      platform_set_shop_status: {
        Args: {
          p_reason: string;
          p_shop_id: string;
          p_status: Database["public"]["Enums"]["shop_status"];
        };
        Returns: Json;
      };
      platform_set_shop_minisite_templates: {
        Args: {
          p_shop_id: string;
          p_allowed: Database["public"]["Enums"]["minisite_template"][];
          p_active: Database["public"]["Enums"]["minisite_template"];
        };
        Returns: Json;
      };
      platform_set_shop_booking_auto_assign: {
        Args: { p_shop_id: string; p_enabled: boolean };
        Returns: Json;
      };
      is_valid_iana_timezone: { Args: { tz: string }; Returns: boolean };
      user_membership_id: { Args: { p_shop_id: string }; Returns: string };
      user_shop_ids: { Args: Record<string, never>; Returns: string[] };
      uuid_v7: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      actor_type: "user" | "platform" | "system";
      appointment_source: "online" | "walk_in";
      appointment_status: "booked" | "completed" | "no_show" | "cancelled";
      membership_role: "owner" | "barber";
      minisite_template: "classic" | "midnight" | "bold" | "signature" | "flux" | "boutique" | "nicoles";
      notification_channel: "email";
      notification_template:
        | "booking_confirmed"
        | "booking_cancelled"
        | "reminder_24h"
        | "owner_new_booking";
      outbox_status: "pending" | "sent" | "failed" | "dead" | "skipped";
      shop_status: "active" | "suspended";
    };
    CompositeTypes: Record<string, never>;
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;
