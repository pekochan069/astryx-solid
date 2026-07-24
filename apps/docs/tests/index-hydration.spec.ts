import { expect, test } from "@playwright/test";

test("prerendered index hydrates without replacing markup", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.stack ?? error.message));
  await page.goto("/");

  await expect(page.locator("#app")).toHaveAttribute("data-hydrated", "reused");
  await page.getByRole("button", { name: "Clicked 0 times" }).click();
  await expect(page.getByRole("button", { name: "Clicked 1 times" })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
