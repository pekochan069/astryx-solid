import { props, type CompiledStyles, type InlineStyles, type StyleXArray } from "@stylexjs/stylex";

/**
 * Converts StyleX output to Solid DOM prop names.
 *
 * StyleX returns `className`; Solid elements consume `class`. Inline styles and
 * `data-style-src` metadata pass through unchanged.
 *
 * @param styles - StyleX styles, arrays, conditions, and dynamic inline styles.
 * @returns Props ready to spread onto a Solid element.
 *
 * @example
 * ```tsx
 * <div {...stylexProps(styles.root, props.active && styles.active)} />
 * ```
 */
export function stylexProps(
  this: unknown,
  ...styles: ReadonlyArray<
    StyleXArray<
      CompiledStyles | boolean | Readonly<[CompiledStyles, InlineStyles] | undefined | null>
    >
  >
): Readonly<{
  class?: string;
  "data-style-src"?: string;
  style?: Readonly<Record<string, string | number>>;
}> {
  const s = props(styles);

  return {
    class: s.className,
    style: s.style,
    "data-style-src": s["data-style-src"],
  };
}
