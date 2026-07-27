import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";
import type { SpacingStep } from "../../types/spacing-steps.types";

import { paddingStyles } from "../../layout/padding.stylex";
import { stylexProps } from "../../stylex";
import { colorVars, radiusVars, spacingVars } from "../../theme/tokens.stylex";
import { size } from "../../utils/size";
import { themeProps } from "../../utils/theme-props";

export type CardVariant =
  | "default"
  | "transparent"
  | "muted"
  | "blue"
  | "cyan"
  | "gray"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "teal"
  | "yellow";

export interface CardProps extends BaseProps<HTMLDivElement> {
  width?: SizeValue;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  padding?: SpacingStep;
  variant?: CardVariant;
  children?: JSX.Element;
}

const styles = stylex.create({
  root: {
    borderRadius: radiusVars["--radius-container"],
    overflow: "clip",
    padding: spacingVars["--spacing-4"],
  },
  bordered: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colorVars["--color-border-emphasized"],
  },
  scrollable: { overflow: "auto" },
  transparent: { backgroundColor: "transparent" },
  default: { backgroundColor: colorVars["--color-background-card"] },
  muted: { backgroundColor: colorVars["--color-background-muted"] },
  blue: { backgroundColor: colorVars["--color-background-blue"] },
  cyan: { backgroundColor: colorVars["--color-background-cyan"] },
  gray: { backgroundColor: colorVars["--color-background-gray"] },
  green: { backgroundColor: colorVars["--color-background-green"] },
  orange: { backgroundColor: colorVars["--color-background-orange"] },
  pink: { backgroundColor: colorVars["--color-background-pink"] },
  purple: { backgroundColor: colorVars["--color-background-purple"] },
  red: { backgroundColor: colorVars["--color-background-red"] },
  teal: { backgroundColor: colorVars["--color-background-teal"] },
  yellow: { backgroundColor: colorVars["--color-background-yellow"] },
});

export function Card(props: CardProps) {
  const rest = omit(
    props,
    "width",
    "height",
    "maxWidth",
    "minHeight",
    "padding",
    "variant",
    "children",
    "xstyle",
    "class",
    "style",
  );

  const variant = () => props.variant ?? "default";
  const theme = createMemo(() => themeProps("card", { variant: variant() }));
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      styles[variant()],
      variant() === "default" && styles.bordered,
      props.height != null && props.height !== "auto" && styles.scrollable,
      props.padding != null && paddingStyles[props.padding],
      props.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{
        ...style().style,
        ...(props.width != null && { width: size(props.width) }),
        ...(props.height != null && { height: size(props.height) }),
        ...(props.maxWidth != null && { "max-width": size(props.maxWidth) }),
        ...(props.minHeight != null && { "min-height": size(props.minHeight) }),
        ...props.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
    </div>
  );
}
