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

export type BookingFlowOptions = {
  /** Skip barber picker — auto-assign first available barber at confirm time. */
  autoAssignBarber?: boolean;
};

/** Fix ISO datetimes where URL query parsing turned '+' into space in the offset. */
export function normalizeBookingSlotParam(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.replace(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?) (\d{2}:\d{2})$/,
    "$1+$2",
  );
}

export function parseBookingUrlState(
  params: URLSearchParams,
  options: BookingFlowOptions = {},
): BookingUrlState {
  const open = params.get(BOOKING_OPEN_PARAM) === "1";
  const serviceId = params.get("service");
  const barberId = params.get("barber");
  const slotStartsAt = normalizeBookingSlotParam(params.get("slot"));
  const autoAssign = options.autoAssignBarber ?? false;

  let step: BookingSheetStep = "service";
  if (serviceId && barberId && slotStartsAt) {
    step = "details";
  } else if (serviceId && barberId) {
    step = "slot";
  } else if (serviceId && autoAssign) {
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

export function bookingStepProgress(step: BookingSheetStep, autoAssignBarber = false): number {
  if (autoAssignBarber) {
    switch (step) {
      case "service":
        return 0.5;
      default:
        return 1;
    }
  }

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
  options: BookingFlowOptions = {},
): URLSearchParams {
  const next = new URLSearchParams(base.toString());
  const autoAssign = options.autoAssignBarber ?? false;

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
    if (autoAssign) {
      next.set("barber", BARBER_FIRST);
    }
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
export function previousBookingSearchParams(
  params: URLSearchParams,
  options: BookingFlowOptions = {},
): URLSearchParams {
  const state = parseBookingUrlState(params, options);
  const autoAssign = options.autoAssignBarber ?? false;

  if (!state.open) {
    return params;
  }
  if (state.slotStartsAt) {
    return buildBookingSearchParams(params, { slotStartsAt: null }, options);
  }
  if (state.barberId) {
    if (autoAssign && state.barberId === BARBER_FIRST) {
      return buildBookingSearchParams(params, { serviceId: null }, options);
    }
    return buildBookingSearchParams(params, { barberId: null }, options);
  }
  if (state.serviceId) {
    return buildBookingSearchParams(params, { serviceId: null }, options);
  }
  return buildBookingSearchParams(params, { open: false }, options);
}
