export type LightDarkValue = readonly [light: string, dark: string];

/** Encode a light/dark pair for CSS. */
export function toLightDark(value: LightDarkValue): string {
  return `light-dark(${value[0]}, ${value[1]})`;
}

function splitTopLevel(value: string): [string, string] | null {
  let depth = 0;
  let quote = "";

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = "";
    } else if (char === "'" || char === '"') quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === "," && depth === 0)
      return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
  }

  return null;
}

/** Resolve a CSS light-dark() expression or an already resolved value. */
export function resolveLightDark(value: string | LightDarkValue, mode: "light" | "dark"): string {
  if (typeof value !== "string") return value[mode === "dark" ? 1 : 0];

  const match = value.trim().match(/^light-dark\((.*)\)$/);
  const sides = match && splitTopLevel(match[1]);

  return sides ? sides[mode === "dark" ? 1 : 0] : value;
}
