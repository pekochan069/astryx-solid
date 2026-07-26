import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("layout primitives render accessible responsive examples", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/components/layout-primitives/");

  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { name: "Layout primitives" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
  await expect(main).toHaveScreenshot("layout-primitives-docs.png");
  expect(errors).toEqual([]);
});
