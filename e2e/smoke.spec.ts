import { expect, test } from "@playwright/test";

const PAGES = ["/", "/earnings", "/rights", "/safety", "/schemes", "/documents", "/grievance"];

for (const path of PAGES) {
  test(`${path} renders with landmarks and a heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });
}

test("language switch translates the UI", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Language").selectOption("hi");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("साथी");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
});

test("schemes page shows real scheme cards with official links", async ({ page }) => {
  await page.goto("/schemes");
  await expect(page.getByRole("link", { name: /Official site/ }).first()).toHaveAttribute("href", /^https:\/\//);
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
});

test("APIs reject invalid input", async ({ request }) => {
  expect((await request.post("/api/safety", { data: { workType: "x", situation: "" } })).status()).toBe(400);
  expect((await request.post("/api/document", { data: { mediaType: "text/html", data: "x" } })).status()).toBe(400);
});

test("SOS opens an emergency dialog with a 112 call link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "SOS" }).click();
  const dialog = page.getByRole("dialog", { name: "Emergency help" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Call 112/ })).toHaveAttribute("href", "tel:112");
});

test("large text mode scales the page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Large text/ }).click();
  await expect(page.locator("html")).toHaveClass(/text-large/);
});

test("Tamil switch translates navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Language").selectOption("ta");
  await expect(page.locator("html")).toHaveAttribute("lang", "ta");
  await expect(page.getByRole("navigation", { name: "Main" })).not.toContainText("Earnings");
});

test.describe("real AI calls", () => {
  test.skip(!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.E2E_BASE_URL, "no AI key");

  test("earnings note is parsed, saved and analysed", async ({ page }) => {
    await page.goto("/earnings");
    await page
      .getByLabel("Tell us about today's work")
      .fill("Today 12 deliveries on Zomato, earned 850, petrol 150, 8 hours");
    await page.getByRole("button", { name: "Read my note" }).click();
    await page.getByRole("button", { name: "Save entry" }).click({ timeout: 30_000 });
    await expect(page.getByText(/Zomato/).first()).toBeVisible();
    await page.getByRole("button", { name: /Get AI insights/ }).click();
    await expect(page.getByRole("region", { name: "AI response" })).toHaveAttribute("aria-busy", "false", {
      timeout: 45_000,
    });
  });

  test("safety coach streams a checklist", async ({ page }) => {
    await page.goto("/safety");
    await page.getByRole("button", { name: "Working outdoors in a heat wave" }).click();
    await page.getByRole("button", { name: /Get safety steps/ }).click();
    const answer = page.getByRole("region", { name: "AI response" });
    await expect(answer).toHaveAttribute("aria-busy", "false", { timeout: 45_000 });
    await expect(answer).not.toBeEmpty();
  });

  test("rights assistant answers a topic question", async ({ page }) => {
    await page.goto("/rights");
    await page.getByRole("button", { name: "Account blocked without reason" }).click();
    await page.getByRole("button", { name: /Explain my rights/ }).click();
    const answer = page.getByRole("region", { name: "AI response" });
    await expect(answer).toHaveAttribute("aria-busy", "false", { timeout: 45_000 });
    await expect(answer).toContainText("15100");
  });
});
