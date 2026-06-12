import { expect, test, type Page } from "@playwright/test";

const password = "password123";

function uniqueEmail() {
  return `journey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@glanzo.test`;
}

async function completeOnboarding(page: Page, shopName: string, slug: string) {
  await expect(page).toHaveURL(/\/onboarding/);

  await page.getByLabel("Shop name").fill(shopName);
  await page.getByLabel("URL slug").fill(slug);
  await expect(page.getByText("Available")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Open my shop" }).click();

  await expect(page).toHaveURL(/\/d$/);
}

async function openMinisiteFromShell(
  page: Page,
  slug: string,
  shopName: string,
  width: number,
) {
  if (width < 1024) {
    await page.getByRole("button", { name: "More options" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: new RegExp(`${slug}\\.`) })).toBeVisible();

    const popup = page.waitForEvent("popup");
    await page.getByRole("link", { name: new RegExp(`${slug}\\.`) }).click();
    const minisite = await popup;
    await expect(minisite.getByRole("heading", { name: shopName })).toBeVisible();
    await expect(minisite.getByText("Opening hours")).toBeVisible();
    await minisite.close();
    await page.keyboard.press("Escape");
  } else {
    await page.goto(`http://${slug}.localhost:3000/`);
    await expect(page.getByRole("heading", { name: shopName })).toBeVisible();
    await expect(page.getByText("Opening hours")).toBeVisible();
    await page.goto("/d");
  }
}

async function signOutFromShell(page: Page, displayName: string, width: number) {
  if (width < 1024) {
    await page.getByRole("button", { name: "More options" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    return;
  }

  await page.getByRole("button", { name: displayName }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
}

async function runPhase1Journey(page: Page, width: number, height: number) {
  const email = uniqueEmail();
  const shopName = "Journey Barber Studio";
  const slug = `journey-${Date.now().toString(36).slice(-8)}`;
  const displayName = "Journey Owner";

  await page.setViewportSize({ width, height });

  await page.goto("/register");
  await page.getByLabel("Display name").fill(displayName);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await completeOnboarding(page, shopName, slug);

  await expect(page.getByText("A quiet morning.")).toBeVisible();
  if (width >= 1024) {
    await expect(page.getByText(shopName, { exact: true })).toBeVisible();
  } else {
    await page.getByRole("button", { name: "More options" }).click();
    await expect(page.getByRole("heading", { name: shopName })).toBeVisible();
    await page.keyboard.press("Escape");
  }

  await openMinisiteFromShell(page, slug, shopName, width);
  await signOutFromShell(page, displayName, width);
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/d$/);
  await expect(page.getByText("A quiet morning.")).toBeVisible();
}

test.describe("Phase 1 journey", () => {
  test("360px — register → onboarding → dashboard → mini-site → sign out → login", async ({
    page,
  }) => {
    await runPhase1Journey(page, 360, 740);
  });

  test("1280px — register → onboarding → dashboard → mini-site → sign out → login", async ({
    page,
  }) => {
    await runPhase1Journey(page, 1280, 800);
  });

  test("suspended seed shop B mini-site shows not-accepting variant", async ({ page }) => {
    await page.goto("http://demo-barber-b.localhost:3000/");
    await expect(page.getByRole("heading", { name: "Demo Barber B" })).toBeVisible();
    await expect(page.getByText(/not accepting bookings/i)).toBeVisible();
  });
});
