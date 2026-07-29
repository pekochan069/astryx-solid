import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";

import { stylexProps } from "../../stylex";
import { size } from "../../utils/size";
import { themeProps } from "../../utils/theme-props";

export type CenterAxis = "both" | "horizontal" | "vertical";

export interface CenterProps extends BaseProps<HTMLDivElement> {
  axis?: CenterAxis;
  width?: SizeValue;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  isInline?: boolean;
  children?: JSX.Element;
}

const styles = stylex.create({
  base: { display: "flex" },
  inline: { display: "inline-flex" },
  horizontal: { justifyContent: "center" },
  vertical: { alignItems: "center" },
});

/** Centers content along one or both flex axes. */
export function Center(props: CenterProps) {
  const merged = merge(
    {
      axis: "both",
    } satisfies Partial<CenterProps>,
    props,
  );
  const rest = omit(
    merged,
    "axis",
    "width",
    "height",
    "maxWidth",
    "minHeight",
    "isInline",
    "xstyle",
    "class",
    "style",
    "children",
  );

  const axis = () => merged.axis ?? "both";
  const theme = createMemo(() => themeProps("center", { axis: axis() }));
  const style = createMemo(() =>
    stylexProps(
      merged.isInline ? styles.inline : styles.base,
      (axis() === "both" || axis() === "horizontal") && styles.horizontal,
      (axis() === "both" || axis() === "vertical") && styles.vertical,
      merged.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, style().class, merged.class]}
      style={{
        ...style().style,
        ...(merged.width != null && { width: size(merged.width) }),
        ...(merged.height != null && { height: size(merged.height) }),
        ...(merged.maxWidth != null && { "max-width": size(merged.maxWidth) }),
        ...(merged.minHeight != null && { "min-height": size(merged.minHeight) }),
        ...merged.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {merged.children}
    </div>
  );
}
