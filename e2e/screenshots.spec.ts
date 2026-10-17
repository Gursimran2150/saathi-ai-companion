import { test } from "@playwright/test";

// Captures README screenshots. Run with: pnpm screenshots
// Add one entry per page/state worth showing.
const SHOTS = [
  "home:/",
  "earnings:/earnings",
  "rights:/rights",
  "safety:/safety",
  "schemes:/schemes",
  "documents:/documents",
  "grievance:/grievance",
].map((s) => {
  const [name, path] = s.split(":");
  return { name, path };
});

test.describe("screenshots", () => {
  test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to capture");

  for (const shot of SHOTS) {
    test(shot.name, async ({ page }, info) => {
      await page.goto(shot.path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      await page.screenshot({ path: `docs/screenshots/${shot.name}-${info.project.name}.png`, fullPage: true });
    });
  }
});
