import {
  type DashboardNavKey,
  isDashboardNavKeyAllowed,
} from "@/lib/dashboard/nav-config";

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
    label: "Heute",
    href: "/d",
    icon: "today",
    enabled: true,
    roles: ["owner", "barber"],
  },
  {
    key: "calendar",
    label: "Kalender",
    href: "/d/calendar",
    icon: "calendar",
    enabled: true,
    roles: ["owner", "barber"],
  },
  {
    key: "customers",
    label: "Kunden",
    href: "/d/customers",
    icon: "customers",
    enabled: true,
    roles: ["owner", "barber"],
  },
  {
    key: "more",
    label: "Mehr",
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
    label: "Leistungen",
    href: "/d/services",
    icon: "scissors",
    enabled: true,
    roles: ["owner"],
    desktopOnly: true,
  },
  {
    key: "staff",
    label: "Team",
    href: "/d/staff",
    icon: "users",
    enabled: true,
    roles: ["owner"],
    desktopOnly: true,
  },
  {
    key: "minisite",
    label: "Website",
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
    label: "Einstellungen",
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

function isNavKeyAllowed(item: NavItem, allowedNavKeys: DashboardNavKey[] | null): boolean {
  if (item.key === "more" || item.isSheetTrigger) {
    return true;
  }
  return isDashboardNavKeyAllowed(item.key as DashboardNavKey, allowedNavKeys);
}

function filterByShopNav(items: NavItem[], allowedNavKeys: DashboardNavKey[] | null): NavItem[] {
  return items.filter((item) => isNavKeyAllowed(item, allowedNavKeys));
}

export function navItemsForSurface(
  surface: "mobile" | "desktop-rail",
  role: NavRole,
  allowedNavKeys: DashboardNavKey[] | null = null,
): NavItem[] {
  if (surface === "mobile") {
    const primary = filterByShopNav(
      DASHBOARD_NAV.filter(
        (item) => item.roles.includes(role) && !item.isSheetTrigger,
      ),
      allowedNavKeys,
    );
    const moreItems = moreSheetNavItems(role, allowedNavKeys);
    const moreTrigger = DASHBOARD_NAV.find((item) => item.key === "more");
    if (moreItems.length > 0 && moreTrigger) {
      return [...primary, moreTrigger];
    }
    return primary;
  }

  const primary = filterByShopNav(
    DASHBOARD_NAV.filter(
      (item) => item.roles.includes(role) && !item.mobileOnly && !item.isSheetTrigger,
    ),
    allowedNavKeys,
  );
  const ownerExtras =
    role === "owner"
      ? filterByShopNav(
          [...OWNER_RAIL_NAV, ...RAIL_DESKTOP_NAV].filter((item) => item.roles.includes(role)),
          allowedNavKeys,
        )
      : [];
  return [...primary, ...ownerExtras];
}

export function moreSheetNavItems(
  role: NavRole,
  allowedNavKeys: DashboardNavKey[] | null = null,
): NavItem[] {
  return filterByShopNav(
    MORE_SHEET_NAV.filter((item) => item.roles.includes(role) && item.enabled),
    allowedNavKeys,
  );
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/d") {
    return pathname === "/d" || pathname === "/d/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
