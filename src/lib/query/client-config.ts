import type { DefaultOptions } from "@tanstack/react-query";

/** Dashboard QueryClient defaults — public surfaces stay query-free. */
export const DASHBOARD_QUERY_DEFAULTS: DefaultOptions = {
  queries: {
    staleTime: 25_000,
    refetchOnWindowFocus: true,
    retry: 1,
  },
};

/** Calendar + Today polling interval (MVP — no Realtime). */
export const CALENDAR_POLL_INTERVAL_MS = 30_000;

/** Today view — faster refresh for live chair updates. */
export const TODAY_POLL_INTERVAL_MS = 15_000;
