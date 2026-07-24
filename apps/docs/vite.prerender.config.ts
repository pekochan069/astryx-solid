import stylex from "@stylexjs/unplugin/vite";
import { resolve } from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@astryx-solid/core/button",
        replacement: resolve(
          import.meta.dirname,
          "../../packages/core/src/components/button/index.ts",
        ),
      },
      {
        find: "@astryx-solid/core/i18n",
        replacement: resolve(import.meta.dirname, "../../packages/core/src/i18n/index.ts"),
      },
      {
        find: "@astryx-solid/core/theme",
        replacement: resolve(import.meta.dirname, "../../packages/core/src/theme/index.ts"),
      },
      {
        find: "@astryx-solid/core/visually-hidden",
        replacement: resolve(
          import.meta.dirname,
          "../../packages/core/src/components/visually-hidden/index.ts",
        ),
      },
      {
        find: "@astryx-solid/core",
        replacement: resolve(import.meta.dirname, "../../packages/core/src/index.ts"),
      },
    ],
  },
  plugins: [
    // @ts-expect-error: stylex plugin problem
    stylex(),
    solid({ ssr: true, solid: { hydratable: true } }),
  ],
});
