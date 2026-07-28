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

const styles = stylex.create({ root: { minWidth: 0 } });

function positiveSpan(value: number | undefined) {
  return value != null && Number.isInteger(value) && value > 0 ? value : undefined;
}

/** Grid item that spans specified columns or rows. */
export function GridSpan(props: GridSpanProps) {
  const rest = omit(props, "columns", "rows", "xstyle", "class", "style", "children");

  const columns = createMemo(() =>
    props.columns === "full" ? "1 / -1" : positiveSpan(props.columns),
  );
  const rows = createMemo(() => positiveSpan(props.rows));

  const theme = themeProps("grid-span");
  const style = createMemo(() => stylexProps(styles.root, props.xstyle));

  return (
    <div
      {...rest}
      {...theme}
      class={[theme.class, style().class, props.class]}
      style={{
        ...style().style,
        ...(columns() != null && {
          "grid-column": columns() === "1 / -1" ? columns() : `span ${columns()}`,
        }),
        ...(rows() != null && { "grid-row": `span ${rows()}` }),
        ...props.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
    </div>
  );
}
