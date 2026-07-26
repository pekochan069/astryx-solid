import { generateHydrationScript, renderToString } from "@solidjs/web";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createUniqueId } from "solid-js";

import { ContentPrimitives, createApp, PackedLayout, packedPrimitives } from "./app";

const render = () =>
  renderToString(() => {
    createUniqueId();
    return createApp();
  });
const first = render();
const primitives = renderToString(
  () => {
    createUniqueId();
    return ContentPrimitives();
  },
  { renderId: "primitives" },
);
if (
  first !== render() ||
  !first.includes("Close dialog") ||
  !first.includes("consumer-light") ||
  !first.includes("Hello") ||
  !first.includes("button") ||
  !first.includes("sm") ||
  !primitives.includes('data-testid="content-primitives"') ||
  !primitives.includes("Reference") ||
  !primitives.includes("Ready")
) {
  throw new Error(`Unexpected server output: ${first}`);
}

const layout = renderToString(PackedLayout, { renderId: "layout" });
if (!layout.includes("Centered") || !layout.includes("Panel") || !layout.includes("Content")) {
  throw new Error(`Unexpected layout server output: ${layout}`);
}

const index = resolve(process.cwd(), "index.html");
let html = (await readFile(index, "utf8"))
  .replace("</head>", `${generateHydrationScript()}</head>`)
  .replace('<div id="app"></div>', `<div id="app">${first}</div>`)
  .replace(
    '<div id="content-primitives"></div>',
    `<div id="content-primitives">${primitives}</div>`,
  );
for (const [name, component] of Object.entries(packedPrimitives)) {
  const output = renderToString(component, { renderId: name });
  html = html.replace(
    `<div id="packed-${name}"></div>`,
    `<div id="packed-${name}">${output}</div>`,
  );
}
await writeFile(index, html);
console.log(first);
