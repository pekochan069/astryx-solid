import { cp, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
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
  await cp(resolve(import.meta.dirname, "../fixtures/packed-build-consumer"), temp, {
    recursive: true,
  });
  await writeFile(
    resolve(temp, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        scripts: { build: "tsc --noEmit && vite build" },
        dependencies: {
          "@astryx-solid/build": `file:${tarball}`,
          "@stylexjs/stylex": "0.19.0",
          "@stylexjs/unplugin": "0.19.0",
          "solid-js": "2.0.0-beta.19",
        },
        devDependencies: {
          typescript: "^7.0.0",
          vite: buildPackage.peerDependencies.vite,
          "vite-plus": "0.2.4",
          "vite-plugin-solid": "3.0.0-next.12",
        },
      },
      null,
      2,
    )}\n`,
  );
  await run(["bun", "install"], temp);
  await run(["bun", "run", "build"], temp);

  const html = await Bun.file(resolve(temp, "dist/index.html")).text();
  if (!html.includes("@layer reset, astryx-base, astryx-theme, product;")) {
    throw new Error("Packed Build package did not inject its CSS layer order");
  }
  console.log("Packed Build consumer passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
