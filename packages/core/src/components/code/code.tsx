import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

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
  base: {
    fontFamily: typographyVars["--font-family-code"],
    fontSize: typeScaleVars["--text-code-size"],
    lineHeight: "inherit",
    backgroundColor: colorVars["--color-background-muted"],
    paddingInline: spacingVars["--spacing-1"],
    paddingBlock: spacingVars["--spacing-0"],
    borderRadius: radiusVars["--radius-inner"],
    // Prevent code from breaking parent layout.
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
});

const colorStyles = stylex.create({
  primary: { color: colorVars["--color-text-primary"] },
  secondary: { color: colorVars["--color-text-secondary"] },
  inherit: { color: "inherit" },
});

const sizeStyles = stylex.create({
  // Match surrounding text for inline code in differently-sized content.
  inherit: { fontSize: "inherit", lineHeight: "inherit" },
});

export function Code(props: CodeProps) {
  const merged = merge(
    {
      color: "primary",
    } satisfies Partial<CodeProps>,
    props,
  );

  const rest = omit(merged, "color", "size", "xstyle", "class", "style", "children");

  const theme = createMemo(() => themeProps("code", { color: merged.color }));
  const style = createMemo(() =>
    stylexProps(
      styles.base,
      colorStyles[merged.color],
      merged.size === "inherit" && sizeStyles.inherit,
      merged.xstyle,
    ),
  );

  return (
    <code
      {...rest}
      {...theme()}
      class={[theme().class, style().class, merged.class]}
      style={{ ...style().style, ...merged.style }}
      data-style-src={style()["data-style-src"]}
    >
      {merged.children}
    </code>
  );
}
