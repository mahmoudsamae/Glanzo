/** Hand-maintained RPC JSON shapes (PostgREST returns Json for these functions). */

export type BookAppointmentRpcResult = {
  id: string;
  shop_id: string;
  manage_token: string;
  starts_at: string;
  ends_at: string;
  idempotent_replay: boolean;
};

export type GetBookingByTokenRpcResult = {
  shop_name: string;
  service_name: string;
  barber_display_name: string;
  starts_at: string;
  ends_at: string;
  status: "booked" | "completed" | "no_show" | "cancelled";
};

export type CancelBookingByTokenRpcResult = {
  id: string;
  status: "booked" | "completed" | "no_show" | "cancelled";
  cancelled_at: string;
};

export type RescheduleBookingByTokenRpcResult = {
  id: string;
  manage_token: string;
  starts_at: string;
  ends_at: string;
};
