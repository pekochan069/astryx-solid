import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

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
  const rest = omit(
    props,
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

  const axis = () => props.axis ?? "both";

  const theme = createMemo(() => themeProps("center", { axis: axis() }));
  const syle = createMemo(() =>
    stylexProps(
      props.isInline ? styles.inline : styles.base,
      (axis() === "both" || axis() === "horizontal") && styles.horizontal,
      (axis() === "both" || axis() === "vertical") && styles.vertical,
      props.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, syle().class, props.class]}
      style={{
        ...syle().style,
        ...(props.width != null && { width: size(props.width) }),
        ...(props.height != null && { height: size(props.height) }),
        ...(props.maxWidth != null && { "max-width": size(props.maxWidth) }),
        ...(props.minHeight != null && { "min-height": size(props.minHeight) }),
        ...props.style,
      }}
      data-style-src={syle()["data-style-src"]}
    >
      {props.children}
    </div>
  );
}
