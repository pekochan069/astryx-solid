import { defineTheme, Theme } from "@astryx-solid/core/theme";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { generateHydrationScript, renderToString } from "@solidjs/web";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const theme = defineTheme({ name: "consumer", tokens: { "--color-accent": ["a", "b"] } });
const render = () => renderToString(() => <VisuallyHidden as="span">Close dialog</VisuallyHidden>);
const first = render();
const themed = renderToString(() => (
  <Theme theme={theme} mode="dark">
    <VisuallyHidden as="span">Close dialog</VisuallyHidden>
  </Theme>
));
if (
  first !== render() ||
  !first.includes("Close dialog") ||
  !themed.includes('data-astryx-solid-theme="consumer"')
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
