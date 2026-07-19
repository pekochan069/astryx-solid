import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

export default defineConfig({
  testDir: "tests",
  outputDir: resolve(root, "artifacts/playwright"),
  reporter: [["list"], ["json", { outputFile: resolve(root, "artifacts/parity/playwright.json") }]],
  expect: { toHaveScreenshot: { animations: "disabled" } },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/components/visually-hidden",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
