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

  const grid = page.getByText("First grid item", { exact: true }).locator("..");
  const form = page.getByLabel("Name").locator("..");
  await expect(grid).toHaveCSS("grid-template-columns", /\S+ \S+/);
  await expect(form).toHaveCSS("display", "grid");

  await page.setViewportSize({ width: 400, height: 800 });
  await expect(grid).toHaveCSS("grid-template-columns", /^\S+$/);
  await expect(form).toHaveCSS("display", "flex");
  expect(errors).toEqual([]);
});
