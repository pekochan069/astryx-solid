import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("container and status primitives render accessible states", async ({ page }) => {
  await page.goto("/components/container-status-primitives/");

  const resizeHandle = page.getByRole("separator", { name: "Resize panel", exact: true });
  const disabledHandle = page.getByRole("separator", { name: "Disabled resize panel" });
  const rtlHandle = page.getByRole("separator", { name: "RTL resize panel" });

  await expect(
    page.getByRole("heading", { name: "Container and status primitives" }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Upload progress" })).toHaveAttribute(
    "aria-valuenow",
    "72",
  );
  await expect(resizeHandle).toBeVisible();
  await expect(page.getByRole("separator", { name: "Resize bottom panel" })).toHaveAttribute(
    "aria-orientation",
    "horizontal",
  );
  await expect(page.getByRole("img", { name: "Online" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Needs attention" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Offline" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Loading progress" })).not.toHaveAttribute(
    "aria-valuenow",
  );
  await expect(page.getByRole("button", { name: "Remove Cover image — Landscape" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Disabled cover" })).toHaveCount(1);

  await resizeHandle.evaluate((handle) => {
    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 20 }));
    window.dispatchEvent(new PointerEvent("pointerup"));
  });
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "220");

  await resizeHandle.press("ArrowRight");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "230");
  await resizeHandle.dblclick();
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "0");
  await resizeHandle.press("Enter");
  await expect(resizeHandle).not.toHaveAttribute("aria-valuenow", "0");

  const enabledSize = await resizeHandle.getAttribute("aria-valuenow");
  await disabledHandle.press("ArrowRight");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", enabledSize ?? "");

  await rtlHandle.press("ArrowRight");
  await expect(rtlHandle).toHaveAttribute("aria-valuenow", "150");
  await expect(page.getByRole("separator", { name: "Vertical resize panel" })).toHaveAttribute(
    "aria-orientation",
    "horizontal",
  );
  await expect(page.getByRole("separator", { name: "Overlay resize panel" })).toBeVisible();

  await page.getByRole("button", { name: "Remove Cover image — Landscape" }).click();
  await expect(page.getByText("Cover image removed")).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);

  await expect(page.getByRole("main")).toHaveScreenshot("container-status-primitives-docs.png");
});
