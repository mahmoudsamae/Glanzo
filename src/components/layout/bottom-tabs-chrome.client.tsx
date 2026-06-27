"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SignOutForm } from "@/components/shared/sign-out-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatShopMinisiteHost } from "@/lib/dashboard/minisite-url";
import type { DashboardNavKey } from "@/lib/dashboard/nav-config";
import { cn } from "@/lib/utils";

import { NAV_ICONS, NAV_ICON_CLASS } from "./nav-icons";
import {
  isNavItemActive,
  moreSheetNavItems,
  navItemsForSurface,
  type NavItem,
  type NavRole,
} from "./nav";

export type BottomTabsChromeProps = {
  shopName: string;
  shopSlug: string;
  minisiteUrl: string;
  displayName: string;
  role: NavRole;
  allowedNavKeys: DashboardNavKey[] | null;
  isPlatformAdmin?: boolean;
  signOutAction: () => Promise<void>;
};

function MobileNavSlot({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const Icon = NAV_ICONS[item.icon];
  const active = item.enabled && !item.isSheetTrigger && isNavItemActive(item.href, pathname);

  const slotClass = cn(
    "salon-dash-mobile-tab flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-[var(--space-1)] py-[var(--space-1)] text-[10px] font-medium transition-all duration-[var(--t-fast)] ease-[var(--ease-enter)]",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)]",
    active ? "salon-dash-mobile-tab--active text-[var(--text-0)]" : "text-[var(--text-2)]",
    !item.enabled && !item.isSheetTrigger ? "cursor-not-allowed opacity-40" : "",
  );

  const label = (
    <>
      <Icon className={NAV_ICON_CLASS} strokeWidth={1.5} aria-hidden />
      <span className="truncate">{item.label}</span>
    </>
  );

  if (item.isSheetTrigger) {
    return (
      <SheetTrigger asChild>
        <button type="button" className={slotClass} aria-label="Weitere Optionen">
          {label}
        </button>
      </SheetTrigger>
    );
  }

  if (!item.enabled) {
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-label={`${item.label} (demnächst)`}
        tabIndex={0}
        className={slotClass}
        onClick={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
          }
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={slotClass}>
      {label}
    </Link>
  );
}

/** Client island 2: mobile bottom tabs + More sheet. */
export function BottomTabsChrome({
  shopName,
  shopSlug,
  minisiteUrl,
  displayName,
  role,
  allowedNavKeys,
  isPlatformAdmin = false,
  signOutAction,
}: BottomTabsChromeProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navItemsForSurface("mobile", role, allowedNavKeys);
  const moreLinks = moreSheetNavItems(role, allowedNavKeys);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <nav
        aria-label="Dashboard"
        className="salon-dash-mobile-dock fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 flex lg:hidden"
      >
        <div className="salon-dash-mobile-dock__inner flex flex-1 gap-[var(--space-1)] p-[var(--space-1)]">
          {items.map((item) => (
            <MobileNavSlot key={item.key} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      <SheetContent side="bottom" className="gap-[var(--space-6)]">
        <SheetHeader>
          <SheetTitle>{shopName}</SheetTitle>
          <a
            href={minisiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-[var(--brass)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-1)]"
          >
            {formatShopMinisiteHost(shopSlug)}
          </a>
        </SheetHeader>

        <p className="text-base text-[var(--text-2)]">{displayName}</p>

        {isPlatformAdmin ? (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-md px-[var(--space-3)] text-base text-[var(--text-1)] hover:bg-[var(--ink-2)]"
          >
            Plattform-Admin
          </Link>
        ) : null}

        {moreLinks.length > 0 ? (
          <ul className="flex flex-col gap-[var(--space-2)]">
            {moreLinks.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-[var(--space-3)] text-base text-[var(--text-1)] hover:bg-[var(--ink-2)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <SignOutForm signOutAction={signOutAction} />
      </SheetContent>
    </Sheet>
  );
}
