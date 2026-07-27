import { resolveLightDark, toLightDark, type LightDarkValue } from "../light-dark";
import { syntaxTokenDefaults } from "./tokens";

export type SyntaxThemeTokenKey =
  keyof typeof syntaxTokenDefaults extends `--color-syntax-${infer Name}` ? Name : never;
export type SyntaxTokenValue = string | LightDarkValue;
export type SyntaxThemeTokenInput = Record<SyntaxThemeTokenKey, SyntaxTokenValue>;
export type SyntaxThemeTokenMap = Record<SyntaxThemeTokenKey, string>;

export interface SyntaxThemeInput {
  name: string;
  tokens: SyntaxThemeTokenInput;
}

export interface SyntaxThemeDefinition {
  name: string;
  tokens: SyntaxThemeTokenMap;
  __inputTokens: SyntaxThemeTokenInput;
}

export const ALL_SYNTAX_KEYS = Object.keys(syntaxTokenDefaults).map((name) =>
  name.replace("--color-syntax-", ""),
) as SyntaxThemeTokenKey[];

function toCssValue(value: SyntaxTokenValue): string {
  return typeof value !== "string" ? toLightDark(value) : value;
}

/** Resolve one syntax token for a concrete color mode. */
export function resolveSyntaxTokenForMode(value: SyntaxTokenValue, mode: "light" | "dark"): string {
  return resolveLightDark(value, mode);
}

/** Define a complete syntax theme. */
export function defineSyntaxTheme(input: SyntaxThemeInput): SyntaxThemeDefinition {
  if (!/^[A-Za-z0-9_-]+$/.test(input.name)) {
    throw new Error(`Invalid syntax theme name: ${input.name}`);
  }

  const missing = ALL_SYNTAX_KEYS.filter((key) => !(key in input.tokens));
  if (missing.length) {
    console.warn(`[Astryx] missing syntax tokens: ${missing.join(", ")}`);
  }

  const tokens = Object.fromEntries(
    ALL_SYNTAX_KEYS.map((key) => [
      key,
      toCssValue(
        input.tokens[key] ??
          syntaxTokenDefaults[`--color-syntax-${key}` as keyof typeof syntaxTokenDefaults],
      ),
    ]),
  ) as SyntaxThemeTokenMap;

  return { name: input.name, tokens, __inputTokens: { ...input.tokens } };
}

/** Build inline CSS variables for a syntax theme. */
export function syntaxThemeStyle(theme: SyntaxThemeDefinition): Record<string, string> {
  return Object.fromEntries(
    ALL_SYNTAX_KEYS.map((key) => [`--color-syntax-${key}`, theme.tokens[key]]),
  );
}

/** Build CSS declarations for a syntax theme. */
export function syntaxThemeToCSS(theme: SyntaxThemeDefinition): string {
  return ALL_SYNTAX_KEYS.map((key) => `--color-syntax-${key}: ${theme.tokens[key]};`).join("\n");
}
