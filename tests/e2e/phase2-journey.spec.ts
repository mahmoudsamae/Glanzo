import { expect, test } from "@playwright/test";

const password = "password123";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/d/);
}

function uniqueInviteEmail() {
  return `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@glanzo.test`;
}

test.describe("Phase 2 owner + invite journey", () => {
  test("owner opens services and staff routes at mobile + desktop widths", async ({ page }) => {
    await login(page, "owner-a@glanzo.test");
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/d/services");
    await expect(page.getByRole("heading", { name: /what do you charge|services/i })).toBeVisible();

    await page.goto("/d/staff");
    await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/d/services");
    await expect(page.getByRole("button", { name: /add service|add your first service/i })).toBeVisible();
  });

  test("barber cannot access services route server-side", async ({ browser }) => {
    const barberContext = await browser.newContext();
    const barberPage = await barberContext.newPage();
    await login(barberPage, "barber-a@glanzo.test");
    await barberPage.goto("/d/services");
    await expect(barberPage).toHaveURL(/\/d$/);
    await barberContext.close();
  });

  test("owner invites barber; barber registers and accepts join link", async ({ browser }) => {
    const inviteEmail = uniqueInviteEmail();
    const displayName = "E2E Invited Barber";

    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await login(ownerPage, "owner-a@glanzo.test");
    await ownerPage.goto("/d/staff");
    await ownerPage.getByPlaceholder("email@example.com").fill(inviteEmail);
    await ownerPage.getByRole("button", { name: "Create link" }).click();
    await expect(ownerPage.locator("code").first()).toBeVisible();
    const joinLink = await ownerPage.locator("code").first().textContent();
    expect(joinLink).toMatch(/\/join\//);

    const barberContext = await browser.newContext();
    const barberPage = await barberContext.newPage();
    await barberPage.goto(joinLink!);
    await expect(barberPage.getByRole("link", { name: "Create account" })).toBeVisible();
    const registerHref = await barberPage.getByRole("link", { name: "Create account" }).getAttribute("href");
    expect(registerHref).toContain("next=%2Fjoin%2F");

    await barberPage.goto(registerHref!);
    await barberPage.getByLabel("Display name").fill(displayName);
    await barberPage.getByLabel("Email").fill(inviteEmail);
    await barberPage.getByLabel("Password").fill(password);
    await barberPage.getByRole("button", { name: "Create account" }).click();

    await expect(barberPage).toHaveURL(/\/join\//);
    await barberPage.getByRole("button", { name: "Accept invite" }).click();
    await expect(barberPage).toHaveURL(/\/d$/);

    await barberPage.goto("/d/staff");
    await expect(barberPage.getByRole("heading", { name: "My schedule" })).toBeVisible();

    await ownerContext.close();
    await barberContext.close();
  });
});
