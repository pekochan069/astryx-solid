import type { Plugin } from "vite";

import stylex from "@stylexjs/unplugin/vite";

export type AstryxStylexOptions = {
  dev?: boolean;
  rootDir?: string;
  layers?: {
    library?: string;
    product?: string;
  };
};

/** Adds Astryx's CSS layer order and configures StyleX for a Vite Plus app. */
export function astryxStylex(options: AstryxStylexOptions = {}): Plugin[] {
  const {
    dev = process.env.NODE_ENV !== "production",
    rootDir = process.cwd(),
    layers = {},
  } = options;
  const library = layers.library ?? "astryx-base";
  const product = layers.product ?? "product";

  return [
    {
      name: "astryx-solid-css-layer-order",
      transformIndexHtml() {
        return [
          {
            tag: "style",
            children: `@layer reset, ${library}, astryx-theme, ${product};`,
            injectTo: "head-prepend",
          },
        ];
      },
    },
    stylex({
      dev,
      runtimeInjection: false,
      treeshakeCompensation: true,
      unstable_moduleResolution: { type: "commonJS", rootDir },
      useCSSLayers: { prefix: product },
    }) as Plugin,
  ];
}
