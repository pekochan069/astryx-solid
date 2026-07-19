import { astryxStylex as rootAstryxStylex } from "@astryx-solid/build";
import { astryxStylex } from "@astryx-solid/build/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

if (rootAstryxStylex !== astryxStylex) throw new Error("Root Build export is unavailable");

export default defineConfig({
  plugins: [...rootAstryxStylex(), solid()],
});
