import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";

import { paddingBlockStyles, paddingInlineStyles } from "../../layout/padding.stylex";
import { stylexProps } from "../../stylex";
import { size } from "../../utils/size";
import { themeProps } from "../../utils/theme-props";
import {
  stack,
  type SpacingStep,
  type StackCrossAlignment,
  type StackDirection,
  type StackMainAlignment,
  type StackWrap,
} from "./stack.stylex";

const overflowStyles = stylex.create({
  scrollable: {
    overflow: "auto",
  },
});

/** Props for the {@link Stack} flex-layout component. */
export interface StackProps extends BaseProps<HTMLElement> {
  /**
   * Direction of the stack layout.
   * - `horizontal`: Items flow left-to-right (like HStack)
   * - `vertical`: Items flow top-to-bottom (like VStack)
   * @default 'vertical'
   */
  direction?: StackDirection;

  /** Main-axis alignment, matching CSS `justify-content`. */
  justify?: StackMainAlignment;

  /** Cross-axis alignment, matching CSS `align-items`. */
  align?: StackCrossAlignment;

  /**
   * Width of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  width?: SizeValue;

  /**
   * Height of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  height?: SizeValue;

  /**
   * Maximum width of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  minHeight?: SizeValue;

  /**
   * Spacing between items.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  gap?: SpacingStep;

  /**
   * Inner padding on all sides, using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   *
   * Matches the `padding` prop on `Card`, `LayoutContent`, and `LayoutPanel`.
   */
  padding?: SpacingStep;

  /**
   * Inline (horizontal) padding, using the spacing scale.
   * Overrides `padding` on the inline axis when both are set.
   */
  paddingInline?: SpacingStep;

  /**
   * Block (vertical) padding, using the spacing scale.
   * Overrides `padding` on the block axis when both are set.
   */
  paddingBlock?: SpacingStep;

  /**
   * Enables scrollable overflow (`overflow: auto`) for the stack.
   *
   * When this stack is a flex child, its parent may also need `min-height: 0`
   * so the browser permits the scroll region to shrink.
   * @default false
   */
  isScrollable?: boolean;

  /**
   * Whether items should wrap.
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to next line
   * - `wrap-reverse`: Items wrap to previous line
   * @default 'nowrap'
   */
  wrap?: StackWrap;

  /**
   * The element type to render.
   * @default 'div'
   */
  as?: ValidComponent;

  /**
   * Inline styles.
   * @default undefined
   */
  style?: JSX.CSSProperties;

  /** Items arranged by the stack. */
  children?: JSX.Element;
}

/**
 * Arranges children in a horizontal or vertical flex layout.
 *
 * @example
 * ```tsx
 * <Stack gap={2}>
 *   <Item />
 *   <Item />
 * </Stack>
 *
 * <Stack direction="horizontal" gap={4} align="center">
 *   <Item />
 *   <Item />
 * </Stack>
 * ```
 */
export function Stack(props: StackProps) {
  const merged = merge(
    {
      direction: "vertical",
      as: "div",
    } satisfies StackProps,
    props,
  );
  const rest = omit(
    merged,
    "direction",
    "justify",
    "align",
    "gap",
    "padding",
    "paddingInline",
    "paddingBlock",
    "isScrollable",
    "width",
    "height",
    "maxWidth",
    "minHeight",
    "wrap",
    "as",
    "xstyle",
    "class",
    "style",
  );

  const resolvedPaddingInline = createMemo(() => merged.paddingInline ?? merged.padding);
  const resolvedPaddingBlock = createMemo(() => merged.paddingBlock ?? merged.padding);

  const theme = createMemo(() =>
    themeProps("stack", {
      direction: merged.direction,
      gap: merged.gap,
      wrap: merged.wrap,
    }),
  );

  const style = createMemo(() =>
    stylexProps(
      ...stack({
        direction: merged.direction,
        mainAlign: merged.justify,
        crossAlign: merged.align,
        gap: merged.gap,
        wrap: merged.wrap,
      }),
      resolvedPaddingInline() != null && paddingInlineStyles[resolvedPaddingInline() ?? 0],
      resolvedPaddingBlock() != null && paddingBlockStyles[resolvedPaddingBlock() ?? 0],
      merged.isScrollable && overflowStyles.scrollable,
      merged.xstyle,
    ),
  );

  const sizingStyle = createMemo(() => ({
    ...(merged.width != null && { width: size(merged.width) }),
    ...(merged.height != null && { height: size(merged.height) }),
    ...(merged.maxWidth != null && { "max-width": size(merged.maxWidth) }),
    ...(merged.minHeight != null && { "min-height": size(merged.minHeight) }),
  }));

  return (
    <Dynamic
      component={merged.as}
      {...rest}
      {...theme()}
      class={[theme().class, style().class, merged.class]}
      style={{
        ...style().style,
        ...sizingStyle(),
        ...merged.style,
      }}
      data-style-src={style()["data-style-src"]}
    />
  );
}
