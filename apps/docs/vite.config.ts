import stylex from "@stylexjs/unplugin/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/, "routeTree.gen.ts"],
  },
  plugins: [
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
      },
    }),
    // @ts-expect-error: stylex plugin problem
    stylex(),
    solid({ ssr: true, solid: { hydratable: true } }),
  ],
});
