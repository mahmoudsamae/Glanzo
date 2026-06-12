#!/usr/bin/env node
import { spawnSync } from "node:child_process";

import { loadEnvFiles } from "./lib/load-env.mjs";

loadEnvFiles();

console.log("Resetting glanzo-test project…");
const reset = spawnSync(process.execPath, ["scripts/db-reset-test.mjs"], {
  stdio: "inherit",
  env: process.env,
});

if (reset.status !== 0) {
  process.exit(reset.status ?? 1);
}

console.log("Running RLS + security suites against test project…");
const vitest = spawnSync(
  "pnpm",
  ["exec", "vitest", "run", "tests/rls", "tests/security"],
  {
    stdio: "inherit",
    env: { ...process.env, REQUIRE_SUPABASE: "1" },
    shell: true,
  },
);

process.exit(vitest.status ?? 1);
