export const BOOKING_OPEN_PARAM = "book";
export const BARBER_FIRST = "first";

export type BookingSheetStep = "service" | "barber" | "slot" | "details";

export type BookingUrlState = {
  open: boolean;
  step: BookingSheetStep;
  serviceId: string | null;
  barberId: string | null;
  slotStartsAt: string | null;
};

export function parseBookingUrlState(params: URLSearchParams): BookingUrlState {
  const open = params.get(BOOKING_OPEN_PARAM) === "1";
  const serviceId = params.get("service");
  const barberId = params.get("barber");
  const slotStartsAt = params.get("slot");

  let step: BookingSheetStep = "service";
  if (serviceId && barberId && slotStartsAt) {
    step = "details";
  } else if (serviceId && barberId) {
    step = "slot";
  } else if (serviceId) {
    step = "barber";
  }

  return {
    open,
    step,
    serviceId,
    barberId,
    slotStartsAt,
  };
}

export function bookingStepProgress(step: BookingSheetStep): number {
  switch (step) {
    case "service":
      return 1 / 3;
    case "barber":
      return 2 / 3;
    default:
      return 1;
  }
}

export function buildBookingSearchParams(
  base: URLSearchParams,
  patch: {
    open?: boolean;
    serviceId?: string | null;
    barberId?: string | null;
    slotStartsAt?: string | null;
  },
): URLSearchParams {
  const next = new URLSearchParams(base.toString());

  if (patch.open === false) {
    next.delete(BOOKING_OPEN_PARAM);
    next.delete("service");
    next.delete("barber");
    next.delete("slot");
    return next;
  }

  if (patch.open === true) {
    next.set(BOOKING_OPEN_PARAM, "1");
  }

  if (patch.serviceId === null) {
    next.delete("service");
    next.delete("barber");
    next.delete("slot");
  } else if (patch.serviceId !== undefined) {
    next.set("service", patch.serviceId);
    next.delete("barber");
    next.delete("slot");
  }

  if (patch.barberId === null) {
    next.delete("barber");
    next.delete("slot");
  } else if (patch.barberId !== undefined) {
    next.set("barber", patch.barberId);
    next.delete("slot");
  }

  if (patch.slotStartsAt === null) {
    next.delete("slot");
  } else if (patch.slotStartsAt !== undefined) {
    next.set("slot", patch.slotStartsAt);
  }

  return next;
}

/** One step back for in-app-browser back / header back. */
export function previousBookingSearchParams(params: URLSearchParams): URLSearchParams {
  const state = parseBookingUrlState(params);
  if (!state.open) {
    return params;
  }
  if (state.slotStartsAt) {
    return buildBookingSearchParams(params, { slotStartsAt: null });
  }
  if (state.barberId) {
    return buildBookingSearchParams(params, { barberId: null });
  }
  if (state.serviceId) {
    return buildBookingSearchParams(params, { serviceId: null });
  }
  return buildBookingSearchParams(params, { open: false });
}
