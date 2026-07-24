import { render } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createComponent, createEffect, createSignal } from "solid-js";

import { defineTheme, generateThemeCSS } from "../../src/theme/define-theme";
import { defineSyntaxTheme, resolveSyntaxTokenForMode } from "../../src/theme/syntax";
import { Theme } from "../../src/theme/theme";
import { resolveThemeToken, resolveThemeTokens, tokenVar } from "../../src/theme/tokens";
import { useTheme } from "../../src/theme/use-theme";

const syntaxTokens = {
  keyword: ["light", "dark"],
  string: ["light", "dark"],
  comment: ["light", "dark"],
  number: ["light", "dark"],
  function: ["light", "dark"],
  type: ["light", "dark"],
  variable: ["light", "dark"],
  operator: ["light", "dark"],
  constant: ["light", "dark"],
  tag: ["light", "dark"],
  attribute: ["light", "dark"],
  property: ["light", "dark"],
  punctuation: ["light", "dark"],
  background: ["light", "dark"],
} as const;

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-astryx-solid-theme");
});

describe("theme substrate", () => {
  it("resolves inherited tokens and light-dark values", () => {
    const base = defineTheme({ name: "base", tokens: { "--color-accent": ["white", "black"] } });
    const theme = defineTheme({ name: "brand", extends: base, tokens: { "--spacing-4": "1rem" } });

    expect(resolveThemeToken(theme, "--color-accent", { mode: "dark" })).toBe("black");
    expect(resolveThemeToken(theme, "--spacing-4", { mode: "light" })).toBe("1rem");
    expect(resolveThemeTokens(theme, { mode: "light" })["--color-accent"]).toBe("white");
  });

  it("generates scoped CSS and variable references", () => {
    const theme = defineTheme({
      name: "brand",
      tokens: { "--color-accent": "red" },
      components: { button: { base: { color: "var(--color-accent)" } } },
    });

    expect(tokenVar("--color-accent")).toBe("var(--color-accent)");
    expect(generateThemeCSS(theme)).toContain('[data-astryx-solid-theme="brand"]');
    expect(generateThemeCSS(theme)).toContain(".astryx-solid-button");
  });

  it("defines syntax themes with mode-aware values", () => {
    const theme = defineSyntaxTheme({ name: "test", tokens: syntaxTokens });
    expect(theme.tokens.keyword).toBe("light-dark(light, dark)");
    expect(resolveSyntaxTokenForMode(["day", "night"], "dark")).toBe("night");
    expect(resolveSyntaxTokenForMode("light-dark(rgb(1, 2, 3), blue)", "light")).toBe(
      "rgb(1, 2, 3)",
    );
  });

  it("updates theme context when props change", async () => {
    const [mode, setMode] = createSignal<"light" | "dark">("light");
    const [theme, setTheme] = createSignal(
      defineTheme({ name: "one", tokens: { "--color-accent": "red" } }),
    );
    const Probe = () => {
      const current = useTheme();
      const node = document.createElement("span");
      createEffect(
        () => `${current.name}:${current.mode}:${current.token("--color-accent")}`,
        (text) => {
          node.textContent = text;
        },
      );
      return node;
    };
    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
      () =>
        createComponent(Theme, {
          get theme() {
            return theme();
          },
          get mode() {
            return mode();
          },
          get children() {
            return createComponent(Probe, {});
          },
        }),
      container,
    );
    expect(container.textContent).toBe("one:light:red");
    setMode("dark");
    setTheme(defineTheme({ name: "two", tokens: { "--color-accent": "blue" } }));
    await Promise.resolve();
    expect(container.textContent).toBe("two:dark:blue");
    dispose();
  });

  it("applies and cleans up root theme attributes", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
      () => createComponent(Theme, { theme: defineTheme({ name: "app" }), mode: "dark" }),
      container,
    );
    await Promise.resolve();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(container.firstElementChild?.getAttribute("data-astryx-solid-theme")).toBe("app");
    dispose();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
