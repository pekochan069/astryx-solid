import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import stylex from "@stylexjs/unplugin/vite";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/],
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
