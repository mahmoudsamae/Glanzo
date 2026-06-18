import { StatusDot } from "@/components/shared/status-dot";

type ShopStatusBadgeProps = {
  status: "active" | "suspended";
};

export function ShopStatusBadge({ status }: ShopStatusBadgeProps) {
  if (status === "active") {
    return <StatusDot label="Aktiv" tone="success" />;
  }
  return <StatusDot label="Suspendiert" tone="owner" />;
}
