import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";
import type { SpacingStep } from "../../types/spacing-steps.types";

import {
  containerPaddingBlockEndVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingInlineVarStyles,
  paddingStyles,
} from "../../layout/padding.stylex";
import { stylexProps } from "../../stylex";
import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from "../../theme/tokens.stylex";
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

export type CardElevation = "none" | "low" | "med" | "high";

export interface CardProps extends BaseProps<HTMLDivElement> {
  width?: SizeValue;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  padding?: SpacingStep;
  variant?: CardVariant;
  elevation?: CardElevation;
  children?: JSX.Element;
}

const cardPadding = `var(--astryx-card-padding, ${spacingVars["--spacing-4"]})`;
const cardPaddingInline = `var(--astryx-card-padding-inline, ${cardPadding})`;
const cardPaddingInlineStart = `var(--astryx-card-padding-inline-start, ${cardPaddingInline})`;
const cardPaddingInlineEnd = `var(--astryx-card-padding-inline-end, ${cardPaddingInline})`;
const cardPaddingBlockStart = `var(--astryx-card-padding-block-start, ${cardPadding})`;
const cardPaddingBlockEnd = `var(--astryx-card-padding-block-end, ${cardPadding})`;

const paddingValues: Record<SpacingStep, string> = {
  0: spacingVars["--spacing-0"],
  0.5: spacingVars["--spacing-0-5"],
  1: spacingVars["--spacing-1"],
  1.5: spacingVars["--spacing-1-5"],
  2: spacingVars["--spacing-2"],
  3: spacingVars["--spacing-3"],
  4: spacingVars["--spacing-4"],
  5: spacingVars["--spacing-5"],
  6: spacingVars["--spacing-6"],
  8: spacingVars["--spacing-8"],
  10: spacingVars["--spacing-10"],
};

const styles = stylex.create({
  card: {
    boxSizing: "border-box",
    "--_card-radius": radiusVars["--radius-container"],
    borderRadius: "var(--_card-radius)",
    overflow: "clip",
    paddingInlineStart: "var(--container-padding-inline-start)",
    paddingInlineEnd: "var(--container-padding-inline-end)",
    paddingBlockStart: "var(--container-padding-block-start)",
    paddingBlockEnd: "var(--container-padding-block-end)",
    "--container-padding-inline-start": cardPaddingInlineStart,
    "--container-padding-inline-end": cardPaddingInlineEnd,
    "--container-padding-block-start": cardPaddingBlockStart,
    "--container-padding-block-end": cardPaddingBlockEnd,
    "--layout-padding-outer-x": cardPaddingInlineStart,
    "--layout-padding-outer-y": cardPaddingBlockStart,
    "--layout-padding-inner-x": cardPaddingInlineStart,
    "--layout-padding-inner-y": cardPaddingBlockStart,
    boxShadow: "var(--_card-ring, 0 0 transparent), var(--_card-elevation, 0 0 transparent)",
  },
  withBorder: {
    borderWidth: borderVars["--border-width"],
    borderStyle: "solid",
    borderColor: colorVars["--color-border-emphasized"],
    paddingInlineStart: `calc(var(--container-padding-inline-start) - ${borderVars["--border-width"]})`,
    paddingInlineEnd: `calc(var(--container-padding-inline-end) - ${borderVars["--border-width"]})`,
    paddingBlockStart: `calc(var(--container-padding-block-start) - ${borderVars["--border-width"]})`,
    paddingBlockEnd: `calc(var(--container-padding-block-end) - ${borderVars["--border-width"]})`,
  },
  scrollable: { overflow: "auto" },
});

const variantStyles = stylex.create({
  default: { backgroundColor: colorVars["--color-background-card"] },
  transparent: { backgroundColor: "transparent" },
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

const elevationStyles = stylex.create({
  none: { "--_card-elevation": "0 0 transparent" },
  low: { "--_card-elevation": shadowVars["--shadow-low"] },
  med: { "--_card-elevation": shadowVars["--shadow-med"] },
  high: { "--_card-elevation": shadowVars["--shadow-high"] },
});

export function Card(props: CardProps) {
  const merged = merge(
    { variant: "default", elevation: "none" } satisfies Partial<CardProps>,
    props,
  );

  const rest = omit(
    merged,
    "width",
    "height",
    "maxWidth",
    "minHeight",
    "padding",
    "variant",
    "elevation",
    "children",
    "xstyle",
    "class",
    "style",
  );

  const explicitPaddingVars = createMemo(() => {
    const value = merged.padding == null ? undefined : paddingValues[merged.padding];

    return value == null
      ? {}
      : {
          "--container-padding-inline-start": value,
          "--container-padding-inline-end": value,
          "--container-padding-block-start": value,
          "--container-padding-block-end": value,
          "--layout-padding-outer-x": value,
          "--layout-padding-outer-y": value,
          "--layout-padding-inner-x": value,
          "--layout-padding-inner-y": value,
        };
  });

  const theme = createMemo(() => themeProps("card", { variant: merged.variant }));
  const style = createMemo(() => {
    const padding = merged.padding;

    return stylexProps(
      styles.card,
      variantStyles[merged.variant],
      elevationStyles[merged.elevation],
      merged.height != null && merged.height !== "auto" && styles.scrollable,
      padding != null && paddingStyles[padding],
      padding != null && containerPaddingInlineVarStyles[padding],
      padding != null && containerPaddingBlockStartVarStyles[padding],
      padding != null && containerPaddingBlockEndVarStyles[padding],
      merged.variant === "default" && styles.withBorder,
      merged.xstyle,
    );
  });

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
        ...explicitPaddingVars(),
        ...merged.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {merged.children}
    </div>
  );
}
