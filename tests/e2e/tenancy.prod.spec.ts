import { expect, test } from "@playwright/test";

const password = "password123";

test.describe("production tenancy hardening", () => {
  test("direct /s/slug on root host returns not-found in production", async ({ page }) => {
    const response = await page.goto("/s/demo-barber-a");
    expect(response?.status()).toBe(404);
  });

  test("?shop= override is dead on root in production", async ({ page }) => {
    await page.goto("/?shop=demo-barber-a");
    await expect(page.getByRole("heading", { name: /Beauty-Studios — operations/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Demo Barber A" })).toHaveCount(0);
  });

  test("X-Forwarded-Host spoofing does not resolve tenant on root", async ({ request }) => {
    const response = await request.get("/?shop=demo-barber-a", {
      headers: {
        "X-Forwarded-Host": "demo-barber-a.localhost:3000",
      },
    });
    const body = await response.text();
    expect(body).toContain("Beauty-Studios — operations");
    expect(body).not.toContain("Demo Barber A");
  });

  test("forged tenant Host on root without ?shop stays marketing", async ({ request }) => {
    const response = await request.get("/", {
      headers: {
        Host: "demo-barber-a.localhost:3000",
      },
    });
    const body = await response.text();
    expect(body).toContain("Beauty-Studios — operations");
  });

  test("real tenant subdomain still resolves in production", async ({ page }) => {
    await page.goto("http://demo-barber-a.localhost:3000/");
    await expect(page.getByRole("heading", { name: "Demo Barber A" })).toBeVisible();
  });

  test("reserved subdomain stays invalid in production", async ({ page }) => {
    await page.goto("http://admin.localhost:3000/");
    await expect(page.getByRole("heading", { name: /doesn't exist/i })).toBeVisible();
  });
});

test.describe("production auth boundaries", () => {
  test("/d unauthenticated redirects to login", async ({ page }) => {
    await page.goto("/d");
    await expect(page).toHaveURL(/\/login/);
  });

  test("ownerA /admin is server-denied — no admin DOM", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("owner-a@glanzo.test");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/d$/);

    const response = await page.request.get("/admin");
    expect(response.url()).toMatch(/\/d$/);
    const html = await response.text();
    expect(html).not.toContain("Admin — Step 6");
  });

  test("corrupted session cookie is treated as unauthenticated", async ({ page, context }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("owner-a@glanzo.test");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/d$/);

    const cookies = await context.cookies();
    const authCookie = cookies.find((cookie) => cookie.name.includes("auth-token"));
    expect(authCookie).toBeDefined();

    await context.addCookies([
      {
        ...authCookie!,
        value: "corrupted-session-token",
      },
    ]);

    await page.goto("/d");
    await expect(page).toHaveURL(/\/login/);
  });
});
