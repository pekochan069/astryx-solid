import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
  input: {
    index: "./src/index.ts",
    vite: "./src/vite.ts",
  },
  external: ["vite", /^@stylexjs\/unplugin/],
  output: {
    cleanDir: true,
  },
  plugins: [dts()],
});
