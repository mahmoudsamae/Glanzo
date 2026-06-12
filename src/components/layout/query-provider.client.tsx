"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { DASHBOARD_QUERY_DEFAULTS } from "@/lib/query/client-config";

export function DashboardQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: DASHBOARD_QUERY_DEFAULTS,
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
