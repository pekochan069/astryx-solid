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
  await writeFile(
    resolve(temp, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        scripts: {
          build:
            "tsc --noEmit && vite build && vite build --ssr src/ssr.tsx --outDir dist-ssr && bun dist-ssr/ssr.js",
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
  console.log("Packed consumer passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
