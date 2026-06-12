"use client";

import { useEffect, useState } from "react";

import type { ShopPublicData } from "@/lib/validations/public-shop";

type BookingSheetGateProps = {
  shopSlug: string;
  data: ShopPublicData;
};

type MountComponent = (props: BookingSheetGateProps) => React.JSX.Element;

/** Runtime import keeps the booking island out of the default /s/* First Load JS. */
export function BookingSheetGate({ shopSlug, data }: BookingSheetGateProps) {
  const [Mount, setMount] = useState<MountComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("./booking-sheet-mount.client").then((module) => {
      if (!cancelled) {
        setMount(() => module.BookingSheetMount);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Mount) {
    return null;
  }

  return <Mount shopSlug={shopSlug} data={data} />;
}
