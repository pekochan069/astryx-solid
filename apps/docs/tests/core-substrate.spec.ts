import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Core theme and i18n substrate stays reactive in the browser", async ({ page, request }) => {
  const response = await request.get("/core-substrate/");
  expect(await response.text()).toContain("Core substrate");

  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.stack ?? error.message));
  await page.goto("/core-substrate/");

  await expect(page.locator("#app")).toHaveAttribute("data-hydrated", "reused");
  await expect(page.getByTestId("theme-state")).toHaveText("docs:light:#0064e0");
  await expect(page.getByTestId("translation")).toHaveText("Hello");
  await expect(page.getByTestId("theme-role")).toHaveCSS("background-color", "rgb(0, 100, 224)");

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.getByTestId("theme-state")).toHaveText("docs:dark:#1557a6");
  await expect(page.getByTestId("theme-role")).toHaveCSS("background-color", "rgb(21, 87, 166)");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: "Toggle locale" }).click();
  await expect(page.getByTestId("translation")).toHaveText("Bonjour");

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  await expect(page.getByRole("main")).toHaveScreenshot("core-substrate-dark.png");
});
