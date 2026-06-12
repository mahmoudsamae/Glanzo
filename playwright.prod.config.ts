import { defineConfig, devices } from "@playwright/test";

import { resolvePlaywrightSupabaseEnv } from "./tests/e2e/playwright-env";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "tenancy.prod.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_PUBLIC_ROOT_DOMAIN: ROOT_DOMAIN,
      ...resolvePlaywrightSupabaseEnv(),
    },
  },
});
