import stylex from "@stylexjs/unplugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
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
    tanstackRouter({
      target: "solid",
      autoCodeSplitting: true,
    }),
    // @ts-expect-error: stylex plugin problem
    stylex(),
    solid({}),
  ],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
