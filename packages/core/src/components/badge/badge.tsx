import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import {
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export interface BadgeVariantMap {
  neutral: true;
  info: true;
  success: true;
  warning: true;
  error: true;
  blue: true;
  cyan: true;
  green: true;
  orange: true;
  pink: true;
  purple: true;
  red: true;
  teal: true;
  yellow: true;
}
export type BadgeVariant = keyof BadgeVariantMap;
export interface BadgeProps extends BaseProps<HTMLSpanElement> {
  variant?: BadgeVariant;
  label: JSX.Element;
  icon?: JSX.Element;
}

const styles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingVars["--spacing-1"],
    height: spacingVars["--spacing-5"],
    paddingBlock: 0,
    paddingInline: spacingVars["--spacing-2"],
    borderRadius: radiusVars["--radius-full"],
    fontFamily: "inherit",
    fontSize: typeScaleVars["--text-supporting-size"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    fontWeight: fontWeightVars["--font-weight-medium"],
    whiteSpace: "nowrap",
  },
  neutral: {
    backgroundColor: colorVars["--color-neutral"],
    color: colorVars["--color-text-primary"],
  },
  info: { backgroundColor: colorVars["--color-accent"], color: colorVars["--color-on-accent"] },
  success: {
    backgroundColor: colorVars["--color-success"],
    color: colorVars["--color-on-success"],
  },
  warning: {
    backgroundColor: colorVars["--color-warning"],
    color: colorVars["--color-on-warning"],
  },
  error: { backgroundColor: colorVars["--color-error"], color: colorVars["--color-on-error"] },
  blue: {
    backgroundColor: colorVars["--color-background-blue"],
    color: colorVars["--color-text-blue"],
  },
  cyan: {
    backgroundColor: colorVars["--color-background-cyan"],
    color: colorVars["--color-text-cyan"],
  },
  green: {
    backgroundColor: colorVars["--color-background-green"],
    color: colorVars["--color-text-green"],
  },
  orange: {
    backgroundColor: colorVars["--color-background-orange"],
    color: colorVars["--color-text-orange"],
  },
  pink: {
    backgroundColor: colorVars["--color-background-pink"],
    color: colorVars["--color-text-pink"],
  },
  purple: {
    backgroundColor: colorVars["--color-background-purple"],
    color: colorVars["--color-text-purple"],
  },
  red: {
    backgroundColor: colorVars["--color-background-red"],
    color: colorVars["--color-text-red"],
  },
  teal: {
    backgroundColor: colorVars["--color-background-teal"],
    color: colorVars["--color-text-teal"],
  },
  yellow: {
    backgroundColor: colorVars["--color-background-yellow"],
    color: colorVars["--color-text-yellow"],
  },
});

export function Badge(props: BadgeProps) {
  const merged = merge(
    {
      variant: "neutral",
    } satisfies Partial<BadgeProps>,
    props,
  );

  const rest = omit(merged, "variant", "label", "icon", "xstyle", "class", "style");

  const theme = createMemo(() => themeProps("badge", { variant: merged.variant }));
  const style = createMemo(() => stylexProps(styles.root, styles[merged.variant], merged.xstyle));

  return (
    <span
      {...rest}
      {...theme()}
      class={[theme().class, style().class, merged.class]}
      style={{ ...style().style, ...merged.style }}
      data-style-src={style()["data-style-src"]}
    >
      {merged.icon}
      {merged.label}
    </span>
  );
}
