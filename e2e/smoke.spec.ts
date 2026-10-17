import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/earnings", "/rights", "/safety", "/schemes", "/documents", "/grievance"];

/** On phones the navigation lives in a drawer; open it so sidebar controls are reachable. */
async function openMenuIfMobile(page: Page) {
  const menu = page.getByRole("button", { name: "Open menu" });
  if (await menu.isVisible()) await menu.click();
}

for (const path of PAGES) {
  test(`${path} renders with a main landmark and a heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
    await expect(page.getByRole("main")).toBeVisible();
  });
}

test("navigation reaches every tool", async ({ page }) => {
  await page.goto("/");
  await openMenuIfMobile(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Rights" }).click();
  await expect(page).toHaveURL(/\/rights$/);
});

test("language switch translates the UI", async ({ page }) => {
  await page.goto("/");
  await openMenuIfMobile(page);
  await page.getByRole("combobox", { name: "Language" }).selectOption("hi");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await expect(page.getByPlaceholder("साथी को लिखें…")).toBeVisible();
});

test("theme toggle switches to dark mode", async ({ page }) => {
  await page.goto("/");
  await openMenuIfMobile(page);
  await page.getByRole("button", { name: "Theme" }).first().click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("large text mode scales the page", async ({ page }) => {
  await page.goto("/");
  await openMenuIfMobile(page);
  await page.getByRole("button", { name: "Large text" }).click();
  await expect(page.locator("html")).toHaveClass(/text-large/);
});

test("SOS opens an emergency dialog with a 112 call link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "SOS" }).click();
  const dialog = page.getByRole("dialog", { name: "Emergency help" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Call 112/ })).toHaveAttribute("href", "tel:112");
});

test("schemes page shows real scheme cards with official links", async ({ page }) => {
  await page.goto("/schemes");
  await expect(page.getByRole("link", { name: /Official site/ }).first()).toHaveAttribute("href", /^https:\/\//);
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/login");
  expect(res.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
});

test("APIs reject invalid input", async ({ request }) => {
  expect((await request.post("/api/safety", { data: { workType: "x", situation: "" } })).status()).toBe(400);
  expect((await request.post("/api/document", { data: { mediaType: "text/html", data: "x" } })).status()).toBe(400);
});

test.describe("real AI calls", () => {
  test.skip(!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.E2E_BASE_URL, "no AI key");
  test.setTimeout(90_000);

  test("chat logs earnings through an AI tool call", async ({ page }) => {
    await page.goto("/");
    await page
      .getByLabel("Type or speak your question")
      .fill("Today 12 deliveries on Zomato, earned 850, petrol 150, 8 hours. Please save it.");
    await page.getByRole("button", { name: "Send" }).click();
    const log = page.getByRole("log", { name: "Conversation" });
    await expect(log.getByRole("button", { name: "Listen" }).first()).toBeVisible({ timeout: 60_000 });
    await page.goto("/earnings");
    await expect(page.getByText(/Zomato/).first()).toBeVisible({ timeout: 15_000 });
  });

  test("rights assistant answers a topic question", async ({ page }) => {
    await page.goto("/rights");
    await page.getByRole("button", { name: "Account blocked without reason" }).click();
    await page.getByRole("button", { name: /Explain my rights/ }).click();
    const answer = page.getByRole("region", { name: "AI response" });
    await expect(answer).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
    await expect(answer).toContainText("15100");
  });
});
