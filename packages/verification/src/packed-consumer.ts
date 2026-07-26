import { chromium, type Browser } from "@playwright/test";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const temp = await mkdtemp(resolve(tmpdir(), "astryx-packed-consumer-"));
const corePackage = await Bun.file(resolve(root, "packages/core/package.json")).json();
const tarball = resolve(temp, `astryx-solid-core-${corePackage.version}.tgz`);

async function run(command: string[], cwd: string) {
  const process = Bun.spawn(command, { cwd, stdout: "inherit", stderr: "inherit" });
  if ((await process.exited) !== 0) throw new Error(`${command.join(" ")} failed`);
}

try {
  await run(
    ["bun", "pm", "pack", "--destination", temp, "--ignore-scripts"],
    resolve(root, "packages/core"),
  );
  await cp(resolve(import.meta.dirname, "../fixtures/packed-consumer"), temp, { recursive: true });
  // SSR injects markup into index.html, so final client build must run after SSR.
  await writeFile(
    resolve(temp, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        scripts: {
          build:
            "tsc --noEmit && vite build && vite build --config vite.ssr.config.ts --ssr src/ssr.tsx --outDir dist-ssr && bun dist-ssr/ssr.js && vite build",
        },
        dependencies: {
          "@astryx-solid/core": `file:${tarball}`,
          "@solidjs/web": corePackage.devDependencies["@solidjs/web"],
          "@stylexjs/stylex": corePackage.peerDependencies["@stylexjs/stylex"],
          "solid-js": corePackage.devDependencies["solid-js"],
        },
        devDependencies: {
          "@types/node": "^26.0.0",
          typescript: "6.0.2",
          vite: "7.1.11",
          "vite-plugin-solid": "3.0.0-next.12",
        },
      },
      null,
      2,
    )}\n`,
  );
  await run(["bun", "install"], temp);
  await run(["bun", "run", "build"], temp);

  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const path = new URL(request.url).pathname;
      const file = Bun.file(resolve(temp, "dist", path === "/" ? "index.html" : `.${path}`));
      return (await file.exists())
        ? new Response(file)
        : new Response("Not found", { status: 404 });
    },
  });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("requestfailed", (request) =>
      runtimeErrors.push(`${request.url()} ${request.failure()?.errorText}`),
    );
    await page.goto(server.url.toString());
    try {
      await page.waitForFunction(
        () =>
          document.getElementById("app")?.dataset.hydrated &&
          document.getElementById("content-primitives")?.dataset.hydrated &&
          document.querySelectorAll('[id^="packed-"][data-hydrated]').length === 6,
        undefined,
        {
          timeout: 5000,
        },
      );
    } catch {
      throw new Error(`Packed consumer runtime failed: ${runtimeErrors.join("; ")}`);
    }
    const hydration = await page.locator("#app").getAttribute("data-hydrated");
    const primitiveHydration = await page
      .locator("#content-primitives")
      .getAttribute("data-hydrated");
    const layoutHydration = await page.locator("#packed-layout").getAttribute("data-hydrated");
    const closeLabels = await page.getByText("Close dialog").count();
    const rootExports = await page.getByText("Root export works").count();
    const contentPrimitives = await page.getByTestId("content-primitives").count();
    const additionalPrimitives = await page.locator('[data-testid^="packed-"]').count();
    const initialContext = await page.locator("#app").getAttribute("data-server-context");
    const role = await page.getByTestId("consumer-role").textContent();
    const size = await page.getByTestId("consumer-size").textContent();
    await page.waitForFunction(() =>
      document.querySelector('[data-testid="consumer-state"]')?.textContent?.includes("Bonjour"),
    );
    const updatedContext = await page.getByTestId("consumer-state").textContent();
    if (
      hydration !== "reused" ||
      primitiveHydration !== "reused" ||
      layoutHydration !== "reused" ||
      closeLabels !== 1 ||
      rootExports !== 1 ||
      contentPrimitives !== 1 ||
      additionalPrimitives !== 6 ||
      initialContext !== "consumer-light:light:a:Hello" ||
      updatedContext !== "consumer-dark:dark:b:Bonjour" ||
      role !== "button" ||
      size !== "sm" ||
      runtimeErrors.length
    ) {
      throw new Error(
        `Packed consumer hydration failed: ${JSON.stringify({ hydration, primitiveHydration, layoutHydration, closeLabels, rootExports, contentPrimitives, additionalPrimitives, initialContext, updatedContext, role, size, runtimeErrors })}`,
      );
    }
  } finally {
    await browser?.close().catch(() => {});
    await server.stop(true);
  }
  console.log("Packed consumer passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
