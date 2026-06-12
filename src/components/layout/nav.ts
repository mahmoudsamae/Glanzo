export type NavRole = "owner" | "barber";

export type NavIconKey =
  | "today"
  | "calendar"
  | "customers"
  | "more"
  | "settings"
  | "scissors"
  | "users"
  | "store";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: NavIconKey;
  enabled: boolean;
  roles: NavRole[];
  /** Mobile bottom bar only (e.g. More sheet trigger). */
  mobileOnly?: boolean;
  /** Desktop rail only (e.g. Settings). */
  desktopOnly?: boolean;
  /** Opens the More sheet instead of navigating. */
  isSheetTrigger?: boolean;
};

/** Primary dashboard navigation — single source of truth for rail + bottom tabs. */
export const DASHBOARD_NAV: NavItem[] = [
  {
    key: "today",
    label: "Today",
    href: "/d",
    icon: "today",
    enabled: true,
    roles: ["owner", "barber"],
  },
  {
    key: "calendar",
    label: "Calendar",
    href: "/d/calendar",
    icon: "calendar",
    enabled: true,
    roles: ["owner", "barber"],
  },
  {
    key: "customers",
    label: "Customers",
    href: "/d/customers",
    icon: "customers",
    enabled: true,
    roles: ["owner", "barber"],
  },
  {
    key: "more",
    label: "More",
    href: "/d",
    icon: "more",
    enabled: true,
    roles: ["owner", "barber"],
    mobileOnly: true,
    isSheetTrigger: true,
  },
];

/** Owner-only desktop rail entries (Phase 2). */
export const OWNER_RAIL_NAV: NavItem[] = [
  {
    key: "services",
    label: "Services",
    href: "/d/services",
    icon: "scissors",
    enabled: true,
    roles: ["owner"],
    desktopOnly: true,
  },
  {
    key: "staff",
    label: "Staff",
    href: "/d/staff",
    icon: "users",
    enabled: true,
    roles: ["owner"],
    desktopOnly: true,
  },
  {
    key: "minisite",
    label: "Minisite",
    href: "/d/minisite",
    icon: "store",
    enabled: true,
    roles: ["owner"],
    desktopOnly: true,
  },
];

/** Desktop rail extras — not shown in mobile bottom tabs. */
export const RAIL_DESKTOP_NAV: NavItem[] = [
  {
    key: "settings",
    label: "Settings",
    href: "/d/settings/shop",
    icon: "settings",
    enabled: true,
    roles: ["owner"],
    desktopOnly: true,
  },
];

/** Owner links surfaced in the mobile More sheet (bottom tabs stay 4). */
export const MORE_SHEET_NAV: NavItem[] = [
  ...OWNER_RAIL_NAV,
  ...RAIL_DESKTOP_NAV,
];

export function navItemsForSurface(
  surface: "mobile" | "desktop-rail",
  role: NavRole,
): NavItem[] {
  if (surface === "mobile") {
    return DASHBOARD_NAV.filter((item) => item.roles.includes(role));
  }

  const primary = DASHBOARD_NAV.filter(
    (item) => item.roles.includes(role) && !item.mobileOnly && !item.isSheetTrigger,
  );
  const ownerExtras =
    role === "owner"
      ? [...OWNER_RAIL_NAV, ...RAIL_DESKTOP_NAV].filter((item) => item.roles.includes(role))
      : [];
  return [...primary, ...ownerExtras];
}

export function moreSheetNavItems(role: NavRole): NavItem[] {
  return MORE_SHEET_NAV.filter((item) => item.roles.includes(role) && item.enabled);
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/d") {
    return pathname === "/d" || pathname === "/d/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
