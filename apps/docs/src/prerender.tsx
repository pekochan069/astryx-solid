import { renderToString } from "@solidjs/web";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { VisuallyHiddenDocs } from "./routes/components.visually-hidden";
import { CoreSubstrate } from "./routes/core-substrate";
import { RouteComponent as Index } from "./routes/index";

const routes = [
  { path: "/", Component: Index },
  { path: "/components/visually-hidden", Component: VisuallyHiddenDocs },
  { path: "/core-substrate", Component: CoreSubstrate },
];
const template = await readFile(resolve(process.cwd(), "dist/index.html"), "utf8");

for (const { path, Component } of routes) {
  const content = renderToString(() => <Component />);
  const output = resolve(process.cwd(), "dist", path.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    template.replace('<div id="app"></div>', `<div id="app">${content}</div>`),
  );
}
