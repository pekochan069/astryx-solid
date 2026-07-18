import { transformAsync } from "@babel/core";
// @ts-expect-error Babel preset ships without declarations.
import typescriptPreset from "@babel/preset-typescript";
import stylexPlugin from "@stylexjs/babel-plugin";
// @ts-expect-error Solid preset ships without declarations.
import solidPreset from "babel-preset-solid";
import { Window } from "happy-dom";

const root = `${import.meta.dir}/../`;

Bun.plugin({
  name: "solid-stylex-tests",
  setup(build) {
    build.onLoad(
      { filter: /packages\/core\/(?:src|tests)\/.*(?:\.tsx|\.stylex\.ts)$/ },
      async ({ path }) => {
        try {
          const result = await transformAsync(await Bun.file(path).text(), {
            filename: path,
            presets: [
              [solidPreset, { generate: "dom", hydratable: false }],
              [typescriptPreset, { isTSX: path.endsWith(".tsx"), allExtensions: true }],
            ],
            plugins: [
              [
                stylexPlugin,
                {
                  dev: false,
                  runtimeInjection: false,
                  unstable_moduleResolution: { type: "commonJS", rootDir: root },
                },
              ],
            ],
          });

          return { contents: result?.code ?? "", loader: "js" };
        } catch (error) {
          console.error(`Failed to compile ${path}`, error);
          throw error;
        }
      },
    );
  },
});

const window = new Window({ url: "http://localhost/" });

Object.assign(globalThis, {
  window,
  self: window,
  document: window.document,
  navigator: window.navigator,
  Node: window.Node,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  HTMLButtonElement: window.HTMLButtonElement,
  Event: window.Event,
  MouseEvent: window.MouseEvent,
  CustomEvent: window.CustomEvent,
  getComputedStyle: window.getComputedStyle.bind(window),
});
