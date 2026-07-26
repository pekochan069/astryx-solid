import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { themeProps } from "../../utils/theme-props";

export interface GridSpanProps extends BaseProps<HTMLDivElement> {
  columns?: number | "full";
  rows?: number;
  children?: JSX.Element;
}

const styles = stylex.create({ root: { display: "grid", minWidth: 0, height: "100%" } });

/** Grid item that spans specified columns or rows. */
export function GridSpan(props: GridSpanProps) {
  const rest = omit(props, "columns", "rows", "xstyle", "class", "style", "children");
  const root = createMemo(() => stylexProps(styles.root, props.xstyle));
  const theme = themeProps("grid-span");

  return (
    <div
      {...rest}
      {...theme}
      class={[theme.class, root().class, props.class]}
      style={{
        ...root().style,
        ...(props.columns != null && {
          "grid-column": props.columns === "full" ? "1 / -1" : `span ${props.columns}`,
        }),
        ...(props.rows != null && { "grid-row": `span ${props.rows}` }),
        ...props.style,
      }}
      data-style-src={root()["data-style-src"]}
    >
      {props.children}
    </div>
  );
}
