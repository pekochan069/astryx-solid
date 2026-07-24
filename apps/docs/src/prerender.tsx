import { generateHydrationScript, renderToString } from "@solidjs/web";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createUniqueId } from "solid-js";

import { createDocsApp } from "./app";
import { prerenderRoutes } from "./prerender-routes";
const root = process.cwd();
const template = (await readFile(resolve(root, "dist/index.html"), "utf8")).replace(
  "<head>",
  `<head>${generateHydrationScript()}`,
);
const generatedRouteTree = await readFile(resolve(root, "src/routeTree.gen.ts"), "utf8");
const generatedPaths = [...generatedRouteTree.matchAll(/fullPath: ['"]([^'"]+)['"]/g)].flatMap(
  ([, path]) => (path ? [path] : []),
);
const prerenderedPaths = prerenderRoutes.map(({ path }) => path);
const prerenderedPathSet = new Set<string>(prerenderedPaths);
if (
  generatedPaths.length !== prerenderedPaths.length ||
  generatedPaths.some((path) => !prerenderedPathSet.has(path))
) {
  throw new Error(
    `Prerender route manifest mismatch: generated=${generatedPaths.join(",")} manifest=${prerenderedPaths.join(",")}`,
  );
}

for (const { path } of prerenderRoutes) {
  const content = renderToString(() => {
    if (path === "/core-substrate") createUniqueId();
    return createDocsApp(path);
  });
  const output = resolve(root, "dist", path.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    template.replace('<div id="app"></div>', `<div id="app">${content}</div>`),
  );
}
