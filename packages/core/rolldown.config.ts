import stylex from "@stylexjs/unplugin/rolldown";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "rolldown";
import { solid } from "rolldown-plugin-dom-expressions-compiler";
import { dts } from "rolldown-plugin-dts";

const stylexPlugin = stylex({
  dev: false,
  runtimeInjection: false,
  unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
});

export default defineConfig({
  input: {
    index: "./src/index.ts",

    button: "./src/components/button/index.ts",
    "visually-hidden": "./src/components/visually-hidden/index.ts",
  },
  platform: "browser",
  external: ["solid-js", "@solidjs/web"],
  output: {
    cleanDir: true,
  },
  plugins: [
    stylexPlugin,
    solid(),
    dts(),
    {
      name: "copy-css-files",
      async generateBundle() {
        const dist = import.meta.dirname + "/dist";

        if (!existsSync(dist)) {
          mkdirSync(dist);
        }

        await Promise.all([
          this.fs.copyFile(
            resolve(import.meta.dirname, "src/reset.css"),
            resolve(import.meta.dirname, "dist/reset.css"),
          ),
          this.fs.copyFile(
            resolve(import.meta.dirname, "src/tailwind-theme.css"),
            resolve(import.meta.dirname, "dist/tailwind-theme.css"),
          ),
        ]);
      },
    },
    {
      name: "emit-astryx-css",
      generateBundle() {
        const css = stylexPlugin.__stylexCollectCss();
        if (!css) throw new Error("No StyleX rules were collected");
        this.emitFile({
          type: "asset",
          fileName: "astryx.css",
          source: `/* Astryx Pre-compiled StyleX CSS */\n\n@layer astryx-base {\n${css}\n}\n`,
        });
      },
    },
  ],
});
