import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import {
  colorVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export type CodeColor = "primary" | "secondary" | "inherit";
export type CodeSize = "inherit";
export interface CodeProps extends BaseProps<HTMLElement> {
  children?: JSX.Element;
  color?: CodeColor;
  size?: CodeSize;
}
const styles = stylex.create({
  root: {
    fontFamily: typographyVars["--font-family-code"],
    fontSize: typeScaleVars["--text-code-size"],
    lineHeight: "inherit",
    backgroundColor: colorVars["--color-background-muted"],
    paddingInline: spacingVars["--spacing-1"],
    paddingBlock: 0,
    borderRadius: radiusVars["--radius-inner"],
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
  primary: { color: colorVars["--color-text-primary"] },
  secondary: { color: colorVars["--color-text-secondary"] },
  inherit: { color: "inherit", fontSize: "inherit" },
});
export function Code(props: CodeProps) {
  const color = () => props.color ?? "primary";

  const rest = omit(props, "color", "size", "xstyle", "class", "style", "children");
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      styles[color()],
      props.size === "inherit" && styles.inherit,
      props.xstyle,
    ),
  );
  const theme = createMemo(() => themeProps("code", { color: color() }));
  return (
    <code
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
    </code>
  );
}
