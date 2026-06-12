import { defineConfig, devices } from "@playwright/test";

import { resolvePlaywrightSupabaseEnv } from "./tests/e2e/playwright-env";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: [
    "tenancy.dev.spec.ts",
    "auth.dev.spec.ts",
    "dashboard-shell.dev.spec.ts",
    "journey.spec.ts",
    "phase2-journey.spec.ts",
    "phase3-api.dev.spec.ts",
  ],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    ...devices["Pixel 5"],
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_ROOT_DOMAIN: ROOT_DOMAIN,
      ...resolvePlaywrightSupabaseEnv(),
    },
  },
});
