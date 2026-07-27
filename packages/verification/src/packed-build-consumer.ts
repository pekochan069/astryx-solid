import { cp, mkdtemp, readdir, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const temp = await mkdtemp(resolve(tmpdir(), "astryx-packed-build-consumer-"));

const buildPackage = await Bun.file(resolve(root, "packages/build/package.json")).json();
const tarball = resolve(temp, `astryx-solid-build-${buildPackage.version}.tgz`);

async function run(command: string[], cwd: string) {
  const process = Bun.spawn(command, { cwd, stdout: "inherit", stderr: "inherit" });

  if ((await process.exited) !== 0) throw new Error(`${command.join(" ")} failed`);
}

try {
  await run(
    ["bun", "pm", "pack", "--destination", temp, "--ignore-scripts"],
    resolve(root, "packages/build"),
  );

  const contents = await readdir(temp);
  if (!contents.includes(`astryx-solid-build-${buildPackage.version}.tgz`)) {
    throw new Error("Build package tarball was not created");
  }

  await rename(tarball, resolve(temp, "astryx-solid-build.tgz"));
  await cp(resolve(import.meta.dirname, "../fixtures/packed-build-consumer"), temp, {
    recursive: true,
  });
  await run(["bun", "install", "--frozen-lockfile"], temp);

  const bundledVite = await Bun.file(
    resolve(temp, "node_modules/@astryx-solid/build/dist/vite.js"),
  ).text();
  if (!/Reflect\.get\(process\.env,\s*["']NODE_ENV["']\)/.test(bundledVite)) {
    throw new Error("Packed Build package folded the consumer NODE_ENV default");
  }

  await run(["bun", "run", "build"], temp);

  const html = await Bun.file(resolve(temp, "dist/index.html")).text();
  if (!html.includes("@layer reset, astryx-base, astryx-theme, product;")) {
    throw new Error("Packed Build package did not inject its CSS layer order");
  }

  const css = await Bun.file(resolve(temp, "dist/assets/stylex.css")).text();
  if (!css.includes("@layer product.priority")) {
    throw new Error("Packed Build package did not nest StyleX CSS in the product layer");
  }

  console.log("Packed Build consumer passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
