import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { themeProps } from "../../utils/theme-props";

export type StackItemCrossAlignSelf = "start" | "center" | "end" | "stretch";
export type StackItemSize = "static" | "fill";

export interface StackItemProps extends BaseProps<HTMLElement> {
  crossAlignSelf?: StackItemCrossAlignSelf;
  size?: StackItemSize;
  isScrollable?: boolean;
  as?: ValidComponent;
  children?: JSX.Element;
}

const styles = stylex.create({
  root: { minWidth: 0, minHeight: 0 },
  static: { flexGrow: 0, flexShrink: 0 },
  fill: { flexGrow: 1 },
  start: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  end: { alignSelf: "flex-end" },
  stretch: { alignSelf: "stretch" },
  scrollable: { overflow: "auto" },
});

/** Controls one item's flex sizing and cross-axis alignment. */
export function StackItem(props: StackItemProps) {
  const rest = omit(
    props,
    "crossAlignSelf",
    "size",
    "isScrollable",
    "as",
    "xstyle",
    "class",
    "style",
  );

  const theme = createMemo(() => themeProps("stack-item", { size: props.size }));
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      styles[props.size ?? "static"],
      props.crossAlignSelf != null && styles[props.crossAlignSelf],
      props.isScrollable && styles.scrollable,
      props.xstyle,
    ),
  );

  return (
    <Dynamic
      component={props.as ?? "div"}
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    />
  );
}
