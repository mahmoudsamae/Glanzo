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
  const baseClass = cn(
    "group relative flex min-h-11 w-full items-center gap-[var(--space-3)] rounded-md px-[var(--space-3)] py-[var(--space-2)] text-base transition-colors duration-[var(--t-fast)] ease-[var(--ease-enter)]",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-0)]",
    active
      ? "text-[var(--text-0)]"
      : item.enabled
        ? "text-[var(--text-2)] hover:bg-[var(--ink-2)] hover:text-[var(--text-1)]"
        : "cursor-not-allowed text-[var(--text-2)] opacity-40",
  );

  const content = (
    <>
      {active ? (
        <span
          aria-hidden
          className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--brass)]"
        />
      ) : null}
      <Icon className={NAV_ICON_CLASS} strokeWidth={1.5} aria-hidden />
      <span
        className={cn(
          "truncate transition-opacity duration-[var(--t-fast)] ease-[var(--ease-enter)] motion-reduce:transition-none",
          collapsed ? "sr-only" : "opacity-100",
        )}
      >
        {item.label}
      </span>
    </>
  );

  if (!item.enabled) {
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-label={`${item.label} (coming soon)`}
        tabIndex={0}
        className={baseClass}
      >
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

/** Client island 1: rail collapse preference + user menu. */
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
    <aside
      aria-label="Dashboard"
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-[var(--ink-1)] transition-[width] duration-[var(--t-fast)] ease-[var(--ease-enter)] motion-reduce:transition-none lg:flex",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border px-[var(--space-3)] py-[var(--space-4)]",
          collapsed ? "justify-center" : "justify-between gap-[var(--space-2)]",
        )}
      >
        {!collapsed ? (
          <p className="truncate font-display text-lg text-[var(--text-0)]" title={shopName}>
            {shopName}
          </p>
        ) : (
          <span className="sr-only">{shopName}</span>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--text-2)] transition-colors hover:bg-[var(--ink-2)] hover:text-[var(--text-1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-1)]"
        >
          {collapsed ? (
            <ChevronRight className="size-4" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-[var(--space-1)] p-[var(--space-2)]">
        {items.map((item) => (
          <NavLinkItem key={item.key} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>

      <div className="border-t border-border p-[var(--space-2)]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex min-h-11 w-full items-center gap-[var(--space-3)] rounded-md px-[var(--space-3)] py-[var(--space-2)] text-left transition-colors hover:bg-[var(--ink-2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-1)]",
                collapsed ? "justify-center" : "",
              )}
            >
              <span
                aria-hidden
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--ink-3)] font-medium text-[var(--text-0)]"
              >
                {avatarInitial(displayName)}
              </span>
              {!collapsed ? (
                <span className="truncate text-base text-[var(--text-1)]">{displayName}</span>
              ) : (
                <span className="sr-only">{displayName}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48">
            {isPlatformAdmin ? (
              <Link
                href="/admin"
                className="flex min-h-11 items-center rounded-md px-[var(--space-3)] text-base text-[var(--text-1)] hover:bg-[var(--ink-2)]"
              >
                Platform Admin
              </Link>
            ) : null}
            <SignOutForm signOutAction={signOutAction} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
