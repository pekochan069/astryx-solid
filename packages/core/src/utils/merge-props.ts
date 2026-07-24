import type { JSX } from "@solidjs/web";

export interface SolidStyleProps {
  class?: string;
  style?: JSX.CSSProperties;
  [key: string]: unknown;
}

/** Merge Solid props while preserving class order and inline-style precedence. */
export function mergeProps(...parts: ReadonlyArray<SolidStyleProps | undefined>): SolidStyleProps {
  const result: SolidStyleProps = {};
  const classes: string[] = [];
  let style: JSX.CSSProperties | undefined;
  for (const part of parts) {
    if (!part) continue;
    Object.assign(result, part);
    if (part.class) classes.push(part.class);
    if (part.style) style = { ...style, ...part.style };
  }
  if (classes.length) result.class = classes.join(" ");
  if (style) result.style = style;
  return result;
}
