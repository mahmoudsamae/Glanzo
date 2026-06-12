import { expect, test } from "@playwright/test";

const password = "password123";
const platformAdminEmail = "platform-admin@glanzo.test";

function uniqueSlug() {
  return `e2e-admin-${Date.now().toString(36)}`;
}

async function loginAs(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("Phase 7 platform admin (desktop)", () => {
  test("admin overview → create shop → owner accepts → suspend → booking blocked → reactivate", async ({
    browser,
  }) => {
    const shopName = "E2E Counter Shop";
    const slug = uniqueSlug();
    const ownerEmail = `e2e-owner-${Date.now()}@glanzo.test`;

    const adminContext = await browser.newContext();
    const ownerContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const ownerPage = await ownerContext.newPage();

    await loginAs(adminPage, platformAdminEmail);
    await expect(adminPage).toHaveURL(/\/admin/);

    await expect(adminPage.getByRole("heading", { name: "Platform" })).toBeVisible();

    await adminPage.goto("/admin/shops/new");
    await adminPage.getByLabel("Shop-Name").fill(shopName);
    await adminPage.getByLabel("Slug").fill(slug);
    await adminPage.getByLabel("Inhaber-E-Mail").fill(ownerEmail);
    await adminPage.getByRole("button", { name: "Shop erstellen" }).click();

    await expect(adminPage.getByRole("heading", { name: "Shop erstellt" })).toBeVisible();
    const inviteLink = adminPage.locator("code").first();
    const inviteUrl = await inviteLink.innerText();

    await ownerPage.goto("/register");
    await ownerPage.getByLabel("Display name").fill("E2E Counter Owner");
    await ownerPage.getByLabel("Email").fill(ownerEmail);
    await ownerPage.getByLabel("Password").fill(password);
    await ownerPage.getByRole("button", { name: "Create account" }).click();

    await ownerPage.goto(inviteUrl);
    await ownerPage.getByRole("button", { name: /accept|beitreten|join/i }).click({ timeout: 15_000 }).catch(() => {
      // join page may auto-accept on load depending on auth state
    });
    await expect(ownerPage).toHaveURL(/\/d/, { timeout: 20_000 });

    await adminPage.goto("/admin/shops");
    await expect(adminPage.getByText(shopName)).toBeVisible();

    await adminPage.getByText(shopName).click();
    await adminPage.getByRole("button", { name: "Suspendieren" }).click();
    await adminPage.locator("#platform-reason").fill("E2E suspend test reason text");
    await adminPage.getByRole("button", { name: "Suspendieren" }).last().click();
    await expect(adminPage.getByText("Suspendiert")).toBeVisible();

    const availability = await ownerPage.request.get(`/api/public/shops/${slug}/availability`);
    if (availability.ok()) {
      const body = (await availability.json()) as { error?: { code?: string } };
      expect(body.error?.code).toBe("SHOP_SUSPENDED");
    } else {
      expect(availability.status()).toBe(403);
    }

    await adminPage.getByRole("button", { name: "Reaktivieren" }).click();
    await adminPage.locator("#platform-reason").fill("E2E reactivate test reason");
    await adminPage.getByRole("button", { name: "Reaktivieren" }).last().click();
    await expect(adminPage.getByText("Aktiv")).toBeVisible();

    await adminContext.close();
    await ownerContext.close();
  });

  test("platform admin can open support Heute tab", async ({ page }) => {
    await loginAs(page, platformAdminEmail);
    await page.goto("/admin/shops");
    await page.getByText("demo-barber-a").first().click();
    await page.getByRole("button", { name: "Heute" }).click();
    await expect(page.getByText(/Support-Ansicht/)).toBeVisible();
  });
});
