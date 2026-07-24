import { tokenDefaults, type DefinedTheme, type TokenName, type TokenValue } from "./defineTheme";

/** Effective color mode used by server-safe token resolution. */
export type ResolvedThemeMode = "light" | "dark";

export interface ResolveThemeTokensOptions {
  mode: ResolvedThemeMode;
}

export interface ResolveThemeTokenOptions extends ResolveThemeTokensOptions {
  fallback?: string;
}

/** Return a CSS variable reference for a token. */
export function tokenVar(name: TokenName | (string & {})): string {
  return `var(${name})`;
}

/** CSS variable references for every known token. */
export const tokenVars = Object.fromEntries(
  Object.keys(tokenDefaults).map((name) => [name, tokenVar(name)]),
) as Record<TokenName, string>;

function splitTopLevel(input: string): [string, string] | null {
  let depth = 0;
  let quote = "";
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (quote) {
      if (char === quote && input[index - 1] !== "\\") quote = "";
    } else if (char === "'" || char === '"') quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === "," && depth === 0)
      return [input.slice(0, index).trim(), input.slice(index + 1).trim()];
  }
  return null;
}

function modeValue(value: TokenValue | string, mode: ResolvedThemeMode): string {
  if (Array.isArray(value)) return value[mode === "dark" ? 1 : 0];
  const match = value.trim().match(/^light-dark\((.*)\)$/);
  const sides = match && splitTopLevel(match[1]);
  return sides ? sides[mode === "dark" ? 1 : 0] : value;
}

function substitute(value: string, values: Record<string, string>, seen: Set<string>): string {
  return value.replace(
    /var\((--[\w-]+)(?:,\s*([^)]*))?\)/g,
    (_match, name: string, fallback?: string) => {
      if (seen.has(name)) return fallback ?? `var(${name})`;
      const resolved = values[name];
      if (resolved === undefined) return fallback ?? `var(${name})`;
      const next = new Set(seen).add(name);
      return substitute(resolved, values, next);
    },
  );
}

/** Resolve all known theme tokens for one explicit color mode. */
export function resolveThemeTokens(
  theme: DefinedTheme | null | undefined,
  options: ResolveThemeTokensOptions,
): Record<string, string> {
  const raw = { ...tokenDefaults, ...theme?.tokens };
  const values: Record<string, string> = {};
  for (const [name, value] of Object.entries(raw)) values[name] = modeValue(value, options.mode);
  for (const name of Object.keys(values))
    values[name] = substitute(values[name], values, new Set([name]));
  return values;
}

/** Resolve one token without reading the DOM or a media query. */
export function resolveThemeToken(
  theme: DefinedTheme | null | undefined,
  name: string,
  options: ResolveThemeTokenOptions,
): string {
  return resolveThemeTokens(theme, options)[name] ?? options.fallback ?? "";
}
