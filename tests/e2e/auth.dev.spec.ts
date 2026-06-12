import { expect, test } from "@playwright/test";

const password = "password123";

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@glanzo.test`;
}

test.describe("Auth + onboarding (360px)", () => {
  test("register → onboarding → dashboard", async ({ page }) => {
    const email = uniqueEmail();
    const shopName = "E2E Barber Studio";

    await page.goto("/register");
    await page.getByLabel("Display name").fill("E2E Owner");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/onboarding/);
    await page.getByLabel("Shop name").fill(shopName);
    await expect(page.getByLabel("URL slug")).not.toHaveValue("");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Open my shop" }).click();

    await expect(page).toHaveURL(/\/d$/);
    await expect(page.getByText("A quiet morning.")).toBeVisible();
  });

  test("seed owner logs in straight to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("owner-a@glanzo.test");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/d$/);
    await expect(page.getByText("A quiet morning.")).toBeVisible();
  });

  test("owner with shop visiting onboarding redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("owner-a@glanzo.test");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/d$/);

    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/d$/);
  });

  test("non-admin denied from admin area", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("owner-a@glanzo.test");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/d$/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/d$/);
  });

  test("unauthenticated user sent to login from dashboard", async ({ page }) => {
    await page.goto("/d");
    await expect(page).toHaveURL(/\/login/);
  });
});
