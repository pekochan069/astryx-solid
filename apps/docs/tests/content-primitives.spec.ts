import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("content primitives remain semantic and accessible", async ({ page }) => {
  await page.goto("/components/content-primitives/");

  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { name: "Content primitives" })).toBeVisible();
  await expect(page.getByText("Ready")).toBeVisible();
  await expect(page.getByRole("img", { name: "Ready" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading preview" })).toBeVisible();
  await expect(page.getByRole("img", { name: /(?:Control|Command) \+ K/ })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
  await expect(main).toHaveScreenshot("content-primitives-docs.png");
});
