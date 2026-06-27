export const DASHBOARD_NAV_KEYS = [
  "today",
  "calendar",
  "customers",
  "services",
  "staff",
  "minisite",
  "settings",
] as const;

export type DashboardNavKey = (typeof DASHBOARD_NAV_KEYS)[number];

export const DASHBOARD_NAV_KEY_LABELS: Record<DashboardNavKey, string> = {
  today: "Heute",
  calendar: "Kalender",
  customers: "Kunden",
  services: "Leistungen",
  staff: "Team",
  minisite: "Website",
  settings: "Einstellungen",
};

export const DASHBOARD_NAV_KEY_DESCRIPTIONS: Record<DashboardNavKey, string> = {
  today: "Tagesübersicht und Terminliste",
  calendar: "Kalender und Terminplanung",
  customers: "Kundenkartei",
  services: "Leistungen und Preise (Inhaber)",
  staff: "Team und Schichten (Inhaber)",
  minisite: "Öffentliche Website (Inhaber)",
  settings: "Shop-Einstellungen (Inhaber)",
};

const DASHBOARD_NAV_KEY_SET = new Set<string>(DASHBOARD_NAV_KEYS);

export function isDashboardNavKey(value: string): value is DashboardNavKey {
  return DASHBOARD_NAV_KEY_SET.has(value);
}

/** NULL = platform has not restricted nav — show all role-allowed items. */
export function normalizeDashboardNavKeys(
  raw: readonly string[] | null | undefined,
): DashboardNavKey[] | null {
  if (raw == null || raw.length === 0) {
    return null;
  }

  const keys = raw.filter(isDashboardNavKey);
  if (keys.length === 0) {
    return null;
  }

  return DASHBOARD_NAV_KEYS.filter((key) => keys.includes(key));
}

export function isDashboardNavKeyAllowed(
  key: DashboardNavKey,
  allowed: DashboardNavKey[] | null,
): boolean {
  if (allowed === null) {
    return true;
  }
  return allowed.includes(key);
}

export function sanitizeDashboardNavKeysInput(keys: readonly string[]): DashboardNavKey[] {
  const unique = new Set<DashboardNavKey>();
  for (const key of keys) {
    if (isDashboardNavKey(key)) {
      unique.add(key);
    }
  }
  return DASHBOARD_NAV_KEYS.filter((key) => unique.has(key));
}

export function canViewShopRevenue(role: "owner" | "barber"): boolean {
  return role === "owner";
}
