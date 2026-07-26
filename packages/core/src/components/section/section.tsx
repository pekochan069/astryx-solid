import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";
import type { SpacingStep } from "../../types/spacing-steps.types";

import {
  containerPaddingBlockEndVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingInlineVarStyles,
  paddingBlockStyles,
  paddingStyles,
  sectionPaddingPropagationStyles,
} from "../../layout/padding.stylex";
import { stylexProps } from "../../stylex";
import { colorVars, spacingVars } from "../../theme/tokens.stylex";
import { size } from "../../utils/size";
import { themeProps } from "../../utils/theme-props";

export interface SectionVariantMap {
  section: true;
  transparent: true;
  muted: true;
}
export type SectionVariant = keyof SectionVariantMap;
export interface SectionProps extends BaseProps<HTMLDivElement> {
  variant?: SectionVariant;
  width?: SizeValue;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  dividers?: Array<"top" | "bottom" | "start" | "end">;
  padding?: SpacingStep;
  paddingBlock?: SpacingStep;
  children?: JSX.Element;
}

const styles = stylex.create({
  outer: {
    marginInlineStart: "calc(-1 * var(--container-padding-inline-start, 0px))",
    marginInlineEnd: "calc(-1 * var(--container-padding-inline-end, 0px))",
  },
  inner: { height: "100%" },
  defaultPadding: {
    paddingInlineStart: `var(--astryx-section-padding-inline-start, var(--astryx-section-padding-inline, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    paddingInlineEnd: `var(--astryx-section-padding-inline-end, var(--astryx-section-padding-inline, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    paddingBlockStart: `var(--astryx-section-padding-block-start, var(--astryx-section-padding-block, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    paddingBlockEnd: `var(--astryx-section-padding-block-end, var(--astryx-section-padding-block, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    "--container-padding-inline-start": `var(--astryx-section-padding-inline-start, var(--astryx-section-padding-inline, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    "--container-padding-inline-end": `var(--astryx-section-padding-inline-end, var(--astryx-section-padding-inline, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    "--container-padding-block-start": `var(--astryx-section-padding-block-start, var(--astryx-section-padding-block, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
    "--container-padding-block-end": `var(--astryx-section-padding-block-end, var(--astryx-section-padding-block, var(--astryx-section-padding, ${spacingVars["--spacing-4"]})))`,
  },
  section: { backgroundColor: colorVars["--color-background-surface"] },
  transparent: { backgroundColor: "transparent" },
  muted: { backgroundColor: colorVars["--color-background-muted"] },
  top: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colorVars["--color-border"],
  },
  bottom: {
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colorVars["--color-border"],
  },
  start: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: colorVars["--color-border"],
  },
  end: {
    borderInlineEndWidth: 1,
    borderInlineEndStyle: "solid",
    borderInlineEndColor: colorVars["--color-border"],
  },
});

/** Container with background variants, dividers, padding, and nested-section bleed. */
export function Section(props: SectionProps) {
  const variant = () => props.variant ?? "section";
  const rest = omit(
    props,
    "variant",
    "width",
    "height",
    "maxWidth",
    "minHeight",
    "dividers",
    "padding",
    "paddingBlock",
    "xstyle",
    "class",
    "style",
    "children",
  );
  const outer = createMemo(() => stylexProps(styles.outer, props.xstyle));
  const inner = createMemo(() =>
    stylexProps(
      styles.inner,
      props.padding == null && styles.defaultPadding,
      styles[variant()],
      props.padding != null && paddingStyles[props.padding],
      props.padding != null && containerPaddingInlineVarStyles[props.padding],
      props.padding != null && containerPaddingBlockStartVarStyles[props.padding],
      props.padding != null && containerPaddingBlockEndVarStyles[props.padding],
      props.padding != null && sectionPaddingPropagationStyles[props.padding],
      props.paddingBlock != null && paddingBlockStyles[props.paddingBlock],
      props.paddingBlock != null && containerPaddingBlockStartVarStyles[props.paddingBlock],
      props.paddingBlock != null && containerPaddingBlockEndVarStyles[props.paddingBlock],
      props.dividers?.includes("top") && styles.top,
      props.dividers?.includes("bottom") && styles.bottom,
      props.dividers?.includes("start") && styles.start,
      props.dividers?.includes("end") && styles.end,
    ),
  );
  const theme = createMemo(() => themeProps("section", { variant: variant() }));

  return (
    <div
      {...rest}
      class={[outer().class, props.class]}
      style={{
        ...outer().style,
        ...(props.width != null && { width: size(props.width) }),
        ...(props.height != null && { height: size(props.height) }),
        ...(props.maxWidth != null && { "max-width": size(props.maxWidth) }),
        ...(props.minHeight != null && { "min-height": size(props.minHeight) }),
        ...props.style,
      }}
      data-style-src={outer()["data-style-src"]}
    >
      <div
        {...theme()}
        class={[theme().class, inner().class]}
        style={inner().style}
        data-style-src={inner()["data-style-src"]}
      >
        {props.children}
      </div>
    </div>
  );
}
