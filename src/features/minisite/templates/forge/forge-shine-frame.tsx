import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ForgeShineFrameVariant = "media" | "panel" | "card";

type ForgeShineFrameProps = {
  children: ReactNode;
  className?: string;
  variant?: ForgeShineFrameVariant;
  /** L-shaped copper accents in the corners (default on panels). */
  corners?: boolean;
  style?: CSSProperties;
};

/**
 * Shared Forge frame — rotating copper highlight on images, cards and panels.
 */
export function ForgeShineFrame({
  children,
  className,
  variant = "media",
  corners,
  style,
}: ForgeShineFrameProps) {
  const showCorners = corners ?? variant === "panel";

  return (
    <div
      className={cn(
        "ms-forge-shine-frame",
        variant === "media" && "ms-forge-shine-frame--media",
        variant === "panel" && "ms-forge-shine-frame--panel",
        variant === "card" && "ms-forge-shine-frame--card",
        showCorners && "ms-forge-shine-frame--corners",
        className,
      )}
      style={style}
    >
      <div className="ms-forge-shine-frame__glow" aria-hidden />
      {showCorners ? (
        <div className="ms-forge-shine-frame__corners" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}
      <div className="ms-forge-shine-frame__inner">{children}</div>
    </div>
  );
}
