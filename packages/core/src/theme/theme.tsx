import { Dynamic, type JSX } from "@solidjs/web";
import { createContext, createEffect, createMemo, useContext } from "solid-js";

import type { DefinedTheme } from "./define-theme";
import type { ThemeMode } from "./types";

import { generateThemeCSS } from "./define-theme";
import { ThemeContext, type ThemeContextValue } from "./use-theme";

const ThemeNestingContext = createContext(false);

export interface ThemeProps {
  theme: DefinedTheme;
  mode?: ThemeMode;
  children?: JSX.Element;
}

function applyRootAttributes(mode: ThemeMode, name: string): VoidFunction | undefined {
  if (typeof document === "undefined") return undefined;
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  root.setAttribute("data-astryx-solid-theme", name);
  return () => {
    root.removeAttribute("data-theme");
    root.removeAttribute("data-astryx-solid-theme");
  };
}

function injectThemeCSS(theme: DefinedTheme): VoidFunction | undefined {
  if (theme.__built || typeof document === "undefined") return undefined;
  const style = document.createElement("style");
  style.setAttribute("data-astryx-solid-theme", theme.name);
  style.textContent = `@layer astryx-theme {\n${generateThemeCSS(theme)}\n}`;
  document.head.append(style);
  return () => style.remove();
}

/** Apply a Solid theme with deterministic SSR markup and browser cleanup. */
export function Theme(props: ThemeProps) {
  const mode = createMemo(() => props.mode ?? "system");
  const context: ThemeContextValue = {
    get theme() {
      return props.theme;
    },
    get mode() {
      return mode();
    },
  };
  const isNested = useContext(ThemeNestingContext);
  if (typeof document !== "undefined") {
    createEffect(
      () => ({ mode: mode(), theme: props.theme, isNested }),
      ({ mode: currentMode, theme, isNested: nested }) => {
        const disposeRoot = nested ? undefined : applyRootAttributes(currentMode, theme.name);
        const disposeStyle = injectThemeCSS(theme);
        return () => {
          disposeRoot?.();
          disposeStyle?.();
        };
      },
    );
  }
  return (
    <ThemeNestingContext value={true}>
      <ThemeContext value={context}>
        <Dynamic
          component="div"
          data-astryx-solid-theme={props.theme.name}
          data-theme={mode() === "system" ? undefined : mode()}
          style={{ "color-scheme": mode() === "system" ? "light dark" : mode() }}
        >
          {props.children}
        </Dynamic>
      </ThemeContext>
    </ThemeNestingContext>
  );
}
