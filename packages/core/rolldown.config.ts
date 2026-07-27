import stylex from "@stylexjs/unplugin/rolldown";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "rolldown";
import { solid } from "rolldown-plugin-dom-expressions-compiler";
import { dts } from "rolldown-plugin-dts";

const input = {
  index: "./src/index.ts",

  button: "./src/components/button/index.ts",
  card: "./src/components/card/index.ts",
  center: "./src/components/center/index.ts",
  "aspect-ratio": "./src/components/aspect-ratio/index.ts",
  badge: "./src/components/badge/index.ts",
  blockquote: "./src/components/blockquote/index.ts",
  citation: "./src/components/citation/index.ts",
  code: "./src/components/code/index.ts",
  divider: "./src/components/divider/index.ts",
  "empty-state": "./src/components/empty-state/index.ts",
  "form-layout": "./src/components/form-layout/index.ts",
  grid: "./src/components/grid/index.ts",
  heading: "./src/components/heading/index.ts",
  icon: "./src/components/icon/index.ts",
  kbd: "./src/components/kbd/index.ts",
  hstack: "./src/components/stack/hstack.tsx",
  layout: "./src/components/layout/index.ts",
  "progress-bar": "./src/components/progress-bar/index.ts",
  resizable: "./src/components/resizable/index.ts",
  section: "./src/components/section/index.ts",
  skeleton: "./src/components/skeleton/index.ts",
  spinner: "./src/components/spinner/index.ts",
  stack: "./src/components/stack/index.ts",
  "status-dot": "./src/components/status-dot/index.ts",
  text: "./src/components/text/index.ts",
  thumbnail: "./src/components/thumbnail/index.ts",
  timestamp: "./src/components/timestamp/index.ts",
  vstack: "./src/components/stack/vstack.tsx",
  "visually-hidden": "./src/components/visually-hidden/index.ts",

  naming: "./src/naming.ts",
  stylex: "./src/stylex/index.ts",
  utils: "./src/utils/index.ts",
  hooks: "./src/hooks/index.ts",
  "interactive-role-context": "./src/interactive-role-context/index.ts",
  "size-context": "./src/size-context/index.ts",
  theme: "./src/theme/index.ts",
  "theme/tokens": "./src/theme/tokens.ts",
  "theme/tokens.stylex": "./src/theme/tokens.stylex.ts",
  "theme/syntax": "./src/theme/syntax/index.ts",
  i18n: "./src/i18n/index.ts",
};

const external = ["solid-js", "@solidjs/web"];

const createStylex = () =>
  stylex({
    dev: false,
    runtimeInjection: false,
    unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
  });

const clientStylex = createStylex();

export default defineConfig([
  {
    input,
    platform: "browser",
    external,
    output: { cleanDir: true },
    plugins: [
      clientStylex,
      solid({ jsx: { hydratable: true } }),
      dts(),
      {
        name: "copy-css-files",
        async generateBundle() {
          const dist = import.meta.dirname + "/dist";

          if (!existsSync(dist)) mkdirSync(dist);

          await Promise.all([
            this.fs.copyFile(
              resolve(import.meta.dirname, "src/reset.css"),
              resolve(dist, "reset.css"),
            ),
            this.fs.copyFile(
              resolve(import.meta.dirname, "src/tailwind-theme.css"),
              resolve(dist, "tailwind-theme.css"),
            ),
          ]);
        },
      },
      {
        name: "emit-astryx-css",
        generateBundle() {
          const css = clientStylex.__stylexCollectCss();

          if (!css) throw new Error("No StyleX rules were collected");

          this.emitFile({
            type: "asset",
            fileName: "astryx.css",
            source: `/* Astryx Pre-compiled StyleX CSS */\n\n@layer astryx-base {\n${css}\n}\n`,
          });
        },
      },
    ],
  },
  {
    input,
    platform: "node",
    external,
    output: { dir: "dist/server", cleanDir: true },
    plugins: [createStylex(), solid({ jsx: { generate: "ssr", hydratable: true } })],
  },
]);
