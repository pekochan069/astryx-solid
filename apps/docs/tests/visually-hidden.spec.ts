import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("VisuallyHidden remains accessible and visually absent", async ({ page }) => {
  await page.goto("/components/visually-hidden/");

  const main = page.getByRole("main");
  const hiddenLabel = page.getByText("Close dialog");
  await expect(page.getByRole("heading", { name: "VisuallyHidden" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close dialog" })).toBeVisible();
  await expect(hiddenLabel).toBeAttached();
  await expect(hiddenLabel).toHaveCSS("position", "absolute");
  await expect(hiddenLabel).toHaveCSS("overflow", "hidden");
  await expect(hiddenLabel).toHaveCSS("width", "1px");
  await expect(page.getByText("Upload complete")).toHaveAttribute("aria-live", "polite");

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
  await expect(main).toHaveScreenshot("visually-hidden-docs.png");
});
