import { expect, test } from "@playwright/test";

const password = "password123";

async function loginAsOwner(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner-a@glanzo.test");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/d$/);
}

test.describe("Dashboard shell", () => {
  test("360px bottom tabs, More sheet, sign out", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await loginAsOwner(page);

    await expect(page.getByRole("navigation", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("A quiet morning.")).toBeVisible();

    await page.getByRole("button", { name: "More options" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: /demo-barber-a\./ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    await page.getByRole("button", { name: "More options" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("1280px rail visible, collapse persists", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAsOwner(page);

    const sidebar = page.locator("aside[aria-label='Dashboard']");
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole("link", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings (coming soon)" })).toBeVisible();

    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  });

  test("disabled Calendar tab does not navigate", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await loginAsOwner(page);

    await page.getByRole("link", { name: "Calendar (coming soon)" }).click();
    await expect(page).toHaveURL(/\/d$/);
  });

  test("barber seed user sees the same shell", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/login");
    await page.getByLabel("Email").fill("barber-a@glanzo.test");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/d$/);
    await expect(page.getByText("A quiet morning.")).toBeVisible();
  });
});
