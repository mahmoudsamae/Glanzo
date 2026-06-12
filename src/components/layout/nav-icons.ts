import {
  CalendarDays,
  LayoutGrid,
  MoreHorizontal,
  Scissors,
  Settings,
  Store,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { NavIconKey } from "./nav";

/** 16px · 1.5px stroke — matches DESIGN-VISION nav spec. */
export const NAV_ICON_CLASS = "size-4 shrink-0";

export const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  today: Sun,
  calendar: CalendarDays,
  customers: LayoutGrid,
  more: MoreHorizontal,
  settings: Settings,
  scissors: Scissors,
  users: Users,
  store: Store,
};
