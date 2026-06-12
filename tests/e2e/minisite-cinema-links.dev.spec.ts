import { expect, test } from "@playwright/test";

test.describe("Mini-site cinema + links (written)", () => {
  test("hero gets ms-cinema-ready after load on public shop", async ({ page }) => {
    await page.goto("/s/demo-barber-a");
    await page.waitForLoadState("load");
    await expect(page.locator("html")).toHaveClass(/ms-cinema-ready/);
    await expect(page.locator(".ms-cinema-word").first()).toBeVisible();
  });

  test("social icon row hidden when no links seeded", async ({ page }) => {
    await page.goto("/s/demo-barber-a");
    const icons = page.getByLabel("Social Links");
    await expect(icons).toHaveCount(0);
  });
});
