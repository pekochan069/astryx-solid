import { generateHydrationScript, renderToString } from "@solidjs/web";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createUniqueId } from "solid-js";

import { createApp } from "./app";

const render = () =>
  renderToString(() => {
    createUniqueId();
    return createApp();
  });
const first = render();
if (
  first !== render() ||
  !first.includes("Close dialog") ||
  !first.includes("consumer-light") ||
  !first.includes("Hello") ||
  !first.includes("button") ||
  !first.includes("sm")
) {
  throw new Error(`Unexpected server output: ${first}`);
}

const index = resolve(process.cwd(), "index.html");
await writeFile(
  index,
  (await readFile(index, "utf8"))
    .replace("</head>", `${generateHydrationScript()}</head>`)
    .replace('<div id="app"></div>', `<div id="app">${first}</div>`),
);
console.log(first);
