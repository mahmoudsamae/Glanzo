import type { ReactNode } from "react";

import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";

import { BottomTabsChrome } from "./bottom-tabs-chrome.client";
import type { NavRole } from "./nav";
import { RailNavChrome } from "./rail-nav-chrome.client";

export type AppShellProps = {
  shopName: string;
  shopSlug: string;
  role: NavRole;
  displayName: string;
  isPlatformAdmin?: boolean;
  signOutAction: () => Promise<void>;
  children: ReactNode;
};

export function AppShell({
  shopName,
  shopSlug,
  role,
  displayName,
  isPlatformAdmin = false,
  signOutAction,
  children,
}: AppShellProps) {
  const minisiteUrl = shopSlug ? buildShopMinisiteUrl(shopSlug) : "#";

  return (
    <div className="salon-dash-root flex min-h-full flex-1">
      <RailNavChrome
        shopName={shopName}
        displayName={displayName}
        role={role}
        isPlatformAdmin={isPlatformAdmin}
        signOutAction={signOutAction}
      />

      <div className="salon-dash-stage flex min-h-full flex-1 flex-col lg:min-w-0">
        <div className="salon-dash-canvas salon-dash-scroll flex min-h-full flex-1 flex-col">
          <main
            id="main-content"
            className="salon-dash-main flex flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
          >
            {children}
          </main>
        </div>
      </div>

      <BottomTabsChrome
        shopName={shopName}
        shopSlug={shopSlug}
        minisiteUrl={minisiteUrl}
        displayName={displayName}
        role={role}
        isPlatformAdmin={isPlatformAdmin}
        signOutAction={signOutAction}
      />
    </div>
  );
}
