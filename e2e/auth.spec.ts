import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("logged-out visitors are sent to login", async ({ page }) => {
  await page.goto("/earnings");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome to Saathi" })).toBeVisible();
});

test("APIs require a session", async ({ request }) => {
  expect((await request.get("/api/earnings")).status()).toBe(401);
  expect((await request.post("/api/chat", { data: { message: "hi", today: "2026-10-17" } })).status()).toBe(401);
});

test("wrong password shows a safe error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@saathi.app");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "incorrect" })).toHaveText("Email or password is incorrect.");
});

test("shared demo credentials work", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@saathi.app");
  await page.getByLabel("Password").fill("saathi-demo-2026");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.waitForURL("/");
});
