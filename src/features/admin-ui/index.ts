"use client";

import dynamic from "next/dynamic";

export const AdminShopsList = dynamic(
  () => import("../admin/components/admin-shops-list.client").then((mod) => mod.AdminShopsList),
);

export const AdminShopDetail = dynamic(
  () => import("../admin/components/admin-shop-detail.client").then((mod) => mod.AdminShopDetail),
);

export const AdminCreateShop = dynamic(
  () => import("../admin/components/admin-create-shop.client").then((mod) => mod.AdminCreateShop),
);
