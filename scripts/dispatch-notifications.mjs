#!/usr/bin/env node
/**
 * Manual worker tick for local dev — POSTs to the dispatch route once.
 * Usage: pnpm jobs:dispatch (requires dev or prod server + CRON_SECRET in .env.local)
 */
import { loadEnv } from "./lib/load-env.mjs";

loadEnv();

const port = process.env.PORT ?? "3000";
const secret = process.env.CRON_SECRET;
const base = process.env.DISPATCH_BASE_URL ?? `http://localhost:${port}`;

if (!secret) {
  console.error("CRON_SECRET is required in .env.local");
  process.exit(1);
}

const response = await fetch(`${base}/api/jobs/dispatch-notifications`, {
  method: "POST",
  headers: { "x-cron-secret": secret },
});

const body = await response.text();
console.info(`dispatch ${response.status}: ${body}`);

if (!response.ok) {
  process.exit(1);
}
