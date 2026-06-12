export const CUSTOMER_PREFILL_KEY = "glanzo:booking-prefill";

export type CustomerPrefill = {
  name: string;
  phone: string;
};

export function readCustomerPrefill(
  storage: Pick<Storage, "getItem">,
): CustomerPrefill | null {
  const raw = storage.getItem(CUSTOMER_PREFILL_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as CustomerPrefill;
    if (typeof parsed.name === "string" && typeof parsed.phone === "string") {
      return { name: parsed.name, phone: parsed.phone };
    }
  } catch {
    return null;
  }
  return null;
}

export function writeCustomerPrefill(
  storage: Pick<Storage, "setItem">,
  value: CustomerPrefill,
): void {
  storage.setItem(CUSTOMER_PREFILL_KEY, JSON.stringify(value));
}
