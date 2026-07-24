import { createContext, createMemo, useContext } from "solid-js";

import type { DefinedTheme } from "./defineTheme";
import type { ThemeMode } from "./types";

import { resolveThemeTokens } from "./tokens";

export interface ThemeContextValue {
  theme: DefinedTheme;
  mode: ThemeMode;
}

export const ThemeContext = createContext<ThemeContextValue>();

export interface UseThemeReturn {
  name: string;
  mode: "light" | "dark";
  token: (name: string) => string;
  tokens: Record<string, string>;
}

function systemMode(): "light" | "dark" {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/** Resolve the current theme for non-CSS consumers. */
export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);
  const mode = createMemo(() => {
    const requested = context?.mode ?? "system";
    return requested === "system" ? systemMode() : requested;
  });
  const tokens = createMemo(() => resolveThemeTokens(context?.theme, { mode: mode() }));
  return {
    get name() {
      return context?.theme.name ?? "default";
    },
    get mode() {
      return mode();
    },
    token: (name) => tokens()[name] ?? "",
    get tokens() {
      return tokens();
    },
  };
}
