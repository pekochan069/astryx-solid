import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { generateHydrationScript, renderToString } from "@solidjs/web";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const render = () => renderToString(() => <VisuallyHidden as="span">Close dialog</VisuallyHidden>);
const first = render();
if (first !== render() || !first.includes("Close dialog")) {
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
