import type { JSX } from "@solidjs/web";
import type { StyleXStyles } from "@stylexjs/stylex";

/**
 * DOM props shared by Astryx components.
 *
 * Includes Solid HTML attributes except `children`, which each component
 * declares with its own content contract.
 */
export interface BaseProps<T extends HTMLElement = HTMLElement> extends Omit<
  JSX.HTMLAttributes<T>,
  "children"
> {
  /**
   * StyleX styles created with `stylex.create()`.
   *
   * Components merge these after their built-in styles, allowing consumers to
   * override supported visual properties without replacing component classes.
   *
   * @example
   * ```tsx
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;

  /** Inline CSS styles applied to the component root. */
  style?: JSX.CSSProperties;

  /** Data attributes for testing, telemetry, and integration hooks. */
  [key: `data-${string}`]: string | undefined;
}
