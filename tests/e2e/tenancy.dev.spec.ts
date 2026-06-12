import { expect, test } from "@playwright/test";

test.describe("tenancy mini-site (dev)", () => {
  test("root domain shows marketing placeholder", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Beauty-Studios — operations/i })).toBeVisible();
  });

  test("www subdomain shows marketing placeholder", async ({ page }) => {
    await page.goto("http://www.localhost:3000/");
    await expect(page.getByRole("heading", { name: /Beauty-Studios — operations/i })).toBeVisible();
  });

  test("tenant subdomain renders shop A name and hours", async ({ page }) => {
    await page.goto("http://demo-barber-a.localhost:3000/");
    await expect(page.getByRole("heading", { name: "Demo Barber A" })).toBeVisible();
    await expect(page.getByText("Opening hours")).toBeVisible();
    await expect(page.getByText("Tuesday")).toBeVisible();
  });

  test("tenant subdomain renders shop B suspended message", async ({ page }) => {
    await page.goto("http://demo-barber-b.localhost:3000/");
    await expect(page.getByRole("heading", { name: "Demo Barber B" })).toBeVisible();
    await expect(page.getByText(/not accepting bookings/i)).toBeVisible();
  });

  test("unknown tenant subdomain shows designed 404", async ({ page }) => {
    await page.goto("http://unknown-shop.localhost:3000/");
    await expect(page.getByRole("heading", { name: /doesn't exist/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to Glanzo/i })).toBeVisible();
  });

  test("reserved subdomain shows designed 404", async ({ page }) => {
    await page.goto("http://admin.localhost:3000/");
    await expect(page.getByRole("heading", { name: /doesn't exist/i })).toBeVisible();
  });
});
