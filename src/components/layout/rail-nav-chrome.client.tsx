"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { SignOutForm } from "@/components/shared/sign-out-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { NAV_ICONS, NAV_ICON_CLASS } from "./nav-icons";
import { isNavItemActive, navItemsForSurface, type NavItem, type NavRole } from "./nav";

const RAIL_COLLAPSE_KEY = "glanzo:rail-collapsed";

export type RailNavChromeProps = {
  shopName: string;
  displayName: string;
  role: NavRole;
  isPlatformAdmin?: boolean;
  signOutAction: () => Promise<void>;
};

function shopMonogram(shopName: string): string {
  const trimmed = shopName.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "G";
}

function NavLinkItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = NAV_ICONS[item.icon];
  const active = item.enabled && isNavItemActive(item.href, pathname);

  const content = (
    <>
      <span
        className={cn(
          "salon-dash-orbit__icon",
          active && "salon-dash-orbit__icon--active",
        )}
      >
        <Icon className={NAV_ICON_CLASS} strokeWidth={1.75} aria-hidden />
      </span>
      {!collapsed ? (
        <span className="salon-dash-orbit__label truncate">{item.label}</span>
      ) : (
        <span className="sr-only">{item.label}</span>
      )}
      {active ? <span className="salon-dash-orbit__active-beam" aria-hidden /> : null}
    </>
  );

  const baseClass = cn(
    "salon-dash-orbit__link",
    active && "salon-dash-orbit__link--active",
    !item.enabled && "salon-dash-orbit__link--disabled",
    collapsed && "salon-dash-orbit__link--collapsed",
  );

  if (!item.enabled) {
    return (
      <span role="link" aria-disabled="true" aria-label={`${item.label} (coming soon)`} className={baseClass}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={baseClass}
      title={collapsed ? item.label : undefined}
    >
      {content}
    </Link>
  );
}

function avatarInitial(displayName: string): string {
  const trimmed = displayName.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function RailNavChrome({
  shopName,
  displayName,
  role,
  isPlatformAdmin = false,
  signOutAction,
}: RailNavChromeProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(RAIL_COLLAPSE_KEY) === "true";
  });
  const items = navItemsForSurface("desktop-rail", role);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(RAIL_COLLAPSE_KEY, String(next));
      return next;
    });
  }

  return (
    <div
      className={cn(
        "salon-dash-orbit-wrap shrink-0",
        collapsed ? "salon-dash-orbit-wrap--collapsed" : "salon-dash-orbit-wrap--expanded",
      )}
    >
      <aside aria-label="Dashboard" className="salon-dash-orbit">
        <span className="salon-dash-orbit__halo" aria-hidden />

        <div className={cn("salon-dash-orbit__head", collapsed && "salon-dash-orbit__head--collapsed")}>
          <span className="salon-dash-orbit__monogram" title={shopName}>
            {shopMonogram(shopName)}
          </span>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="salon-dash-kicker text-[10px]">Glanzo</p>
              <p className="salon-dash-shop-name mt-[var(--space-1)] truncate font-display text-lg leading-tight" title={shopName}>
                {shopName}
              </p>
            </div>
          ) : null}
        </div>

        <nav aria-label="Primary" className="salon-dash-orbit__nav">
          {items.map((item) => (
            <NavLinkItem key={item.key} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </nav>

        <div className="salon-dash-orbit__foot">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn("salon-dash-orbit__profile", collapsed && "salon-dash-orbit__profile--collapsed")}
              >
                <span aria-hidden className="salon-dash-avatar">
                  {avatarInitial(displayName)}
                </span>
                {!collapsed ? (
                  <span className="min-w-0 truncate text-left">
                    <span className="block truncate text-sm font-medium text-[var(--text-0)]">{displayName}</span>
                    <span className="block truncate text-xs text-[var(--text-2)]">Account</span>
                  </span>
                ) : (
                  <span className="sr-only">{displayName}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-52">
              {isPlatformAdmin ? (
                <Link
                  href="/admin"
                  className="flex min-h-10 items-center rounded-md px-[var(--space-3)] text-sm text-[var(--text-1)] hover:bg-[var(--ink-2)]"
                >
                  Platform Admin
                </Link>
              ) : null}
              <SignOutForm signOutAction={signOutAction} />
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="salon-dash-orbit__toggle"
          >
            {collapsed ? (
              <ChevronRight className="size-4" strokeWidth={1.5} />
            ) : (
              <ChevronLeft className="size-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
