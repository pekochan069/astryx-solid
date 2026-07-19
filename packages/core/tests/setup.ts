import stylex from "@stylexjs/unplugin/rolldown";
import { Window } from "happy-dom";
import { rolldown } from "rolldown";
import { solid } from "rolldown-plugin-dom-expressions-jsx-compiler";

const root = `${import.meta.dir}/../`;

Bun.plugin({
  name: "solid-tests",
  setup(build) {
    build.onLoad(
      { filter: /packages\/core\/(?:src|tests)\/.*(?:\.tsx|\.stylex\.ts)$/ },
      async ({ path }) => {
        try {
          const bundle = await rolldown({
            input: path,
            external: (id) => id !== path,
            plugins: [
              stylex({
                dev: false,
                runtimeInjection: false,
                unstable_moduleResolution: { type: "commonJS", rootDir: root },
              }),
              solid(),
            ],
          });
          const { output } = await bundle.generate({ format: "esm" });
          const chunk = output.find((item) => item.type === "chunk");
          if (!chunk) throw new Error(`No JavaScript emitted for ${path}`);
          return { contents: chunk.code, loader: "js" };
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
