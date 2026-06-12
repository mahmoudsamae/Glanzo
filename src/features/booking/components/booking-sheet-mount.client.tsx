"use client";

import dynamic from "next/dynamic";

import type { ShopPublicData } from "@/lib/validations/public-shop";

const BookingSheetClient = dynamic(
  () =>
    import("./booking-sheet.client").then((module) => ({
      default: module.BookingSheetClient,
    })),
  { ssr: false, loading: () => null },
);

type BookingSheetMountProps = {
  shopSlug: string;
  data: ShopPublicData;
};

/** Code-splits the booking island — parent page renders this only when ?book=1. */
export function BookingSheetMount({ shopSlug, data }: BookingSheetMountProps) {
  return <BookingSheetClient shopSlug={shopSlug} data={data} />;
}
