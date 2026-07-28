import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("action foundation hydrates accessible interaction states", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/components/action-foundation");
  await expect(page.getByRole("heading", { name: "Action foundation" })).toBeVisible();

  const external = page.getByRole("link", { name: /External link.*opens in new tab/ });
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(external).toHaveAttribute("rel", /noopener/);
  await expect(page.getByRole("link", { name: "Router link" })).toHaveAttribute(
    "data-router-link",
    "true",
  );
  await expect(page.getByText("Disabled link", { exact: true })).not.toHaveAttribute("href");

  const unavailable = page.getByRole("button", { name: "Unavailable action" });
  await unavailable.focus();
  await expect(page.getByRole("tooltip")).toHaveText("Available after setup");
  await unavailable.press("Enter");
  await expect(unavailable).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator('button[aria-busy="true"]')).toHaveCount(1);

  const cut = page.getByRole("button", { name: "Cut" });
  await cut.focus();
  await cut.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Copy" })).toBeFocused();
  await page.getByRole("button", { name: "Copy" }).press("End");
  await expect(page.getByRole("link", { name: "Paste" })).toBeFocused();

  const favorite = page.getByRole("button", { name: "Favorite" });
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await expect(favorite).toContainText("★");

  await page.getByRole("button", { name: "List" }).click();
  await expect(page.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Italic" }).click();
  await expect(page.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Italic" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.getByRole("main")).toHaveScreenshot("action-foundation-docs.png");
});
