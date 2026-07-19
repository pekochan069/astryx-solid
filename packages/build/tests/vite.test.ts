import { describe, expect, it } from "bun:test";

import { astryxStylex as rootAstryxStylex } from "../src/index";
import { astryxStylex } from "../src/vite";

function layerOrder(options?: Parameters<typeof astryxStylex>[0]) {
  const plugin = astryxStylex(options).find((item) => item.name === "astryx-solid-css-layer-order");
  if (!plugin || typeof plugin.transformIndexHtml !== "function")
    throw new Error("Missing layer plugin");
  const transform = plugin.transformIndexHtml as unknown as () => { children: string }[];
  const tags = transform();
  return Array.isArray(tags) ? tags[0]?.children : undefined;
}

describe("astryxStylex", () => {
  it("declares Astryx's CSS layer order", () => {
    expect(layerOrder()).toBe("@layer reset, astryx-base, astryx-theme, product;");
    expect(rootAstryxStylex).toBe(astryxStylex);
  });

  it("allows the library and product layer names to be replaced", () => {
    expect(layerOrder({ layers: { library: "library", product: "app" } })).toBe(
      "@layer reset, library, astryx-theme, app;",
    );
  });
});
