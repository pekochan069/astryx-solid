import { expect, test } from "@playwright/test";

test("prerendered index hydrates", async ({ page, request }) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(html.replace(/<[^>]+>/g, "")).toContain("Clicked 0 times");

  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.stack ?? error.message));
  await page.goto("/");

  await page.getByRole("button", { name: "Clicked 0 times" }).click();
  await expect(page.getByRole("button", { name: "Clicked 1 times" })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
