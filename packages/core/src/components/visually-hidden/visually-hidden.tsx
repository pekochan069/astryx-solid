import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

/**
 * Props for {@link VisuallyHidden}.
 *
 * Consumer `class` and `style` props are omitted so the fixed accessibility
 * styles cannot be displaced accidentally. ARIA attributes, roles, IDs, data
 * attributes, event handlers, and refs pass through to the rendered element.
 */
export interface VisuallyHiddenProps extends Omit<BaseProps, "class" | "style"> {
  /** Content exposed to assistive technology while hidden visually. */
  children?: JSX.Element;

  /** Element or component to render. @default "div" */
  as?: ValidComponent;
}

const styles = stylex.create({
  // Canonical "visually hidden" clip block. Uses `clip: rect(...)` (not
  // clip-path) for the widest assistive-tech/browser support. `inset` pins the
  // 1px box to the top-left so a positioned ancestor cannot reveal it, and
  // pointer/selection are disabled so the hidden node can't catch clicks or be
  // text-selected.
  visuallyHidden: {
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderStyle: "none",
    insetBlockStart: 0,
    insetInlineStart: 0,
    pointerEvents: "none",
    userSelect: "none",
  },
});

/**
 * Hides content visually while keeping it in the accessibility tree.
 *
 * Use for icon-only control labels, live-region announcements, and extra
 * screen-reader context.
 *
 * @example
 * ```tsx
 * <VisuallyHidden>Delete incident</VisuallyHidden>
 * <VisuallyHidden as="div" aria-live="polite">
 *   Upload complete
 * </VisuallyHidden>
 * ```
 */
export function VisuallyHidden(props: VisuallyHiddenProps) {
  const merged = merge({ as: "div" }, props);
  const style = createMemo(() => {
    const stylexProps = stylex.props(styles.visuallyHidden);
    return {
      class: stylexProps.className,
      style: stylexProps.style,
      "data-stylex-src": stylexProps["data-style-src"],
    };
  });

  const rest = omit(merged, "as");

  return <Dynamic component={merged.as} {...style()} {...rest} />;
}
