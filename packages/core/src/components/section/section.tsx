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

const sectionPadding = `var(--astryx-section-padding, ${spacingVars["--spacing-4"]})`;
const sectionPaddingInline = `var(--astryx-section-padding-inline, ${sectionPadding})`;
const sectionPaddingInlineStart = `var(--astryx-section-padding-inline-start, ${sectionPaddingInline})`;
const sectionPaddingInlineEnd = `var(--astryx-section-padding-inline-end, ${sectionPaddingInline})`;
const sectionPaddingBlockStart = `var(--astryx-section-padding-block-start, ${sectionPadding})`;
const sectionPaddingBlockEnd = `var(--astryx-section-padding-block-end, ${sectionPadding})`;

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
  outer: {
    marginInlineStart: "calc(-1 * var(--container-padding-inline-start, 0px))",
    marginInlineEnd: "calc(-1 * var(--container-padding-inline-end, 0px))",
    marginBlockStart: {
      default: null,
      ":first-child": "calc(-1 * var(--container-padding-block-start, 0px))",
    },
    marginBlockEnd: {
      default: null,
      ":last-child": "calc(-1 * var(--container-padding-block-end, 0px))",
    },
  },
  inner: { height: "100%", boxSizing: "border-box" },
  defaultPadding: {
    paddingInlineStart: sectionPaddingInlineStart,
    paddingInlineEnd: sectionPaddingInlineEnd,
    paddingBlockStart: sectionPaddingBlockStart,
    paddingBlockEnd: sectionPaddingBlockEnd,
    "--container-padding-inline-start": sectionPaddingInlineStart,
    "--container-padding-inline-end": sectionPaddingInlineEnd,
    "--container-padding-block-start": sectionPaddingBlockStart,
    "--container-padding-block-end": sectionPaddingBlockEnd,
    "--layout-padding-outer-x": sectionPaddingInlineStart,
    "--layout-padding-outer-y": sectionPaddingBlockStart,
    "--layout-padding-inner-x": sectionPaddingInlineStart,
    "--layout-padding-inner-y": sectionPaddingBlockStart,
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
  const merged = merge(
    {
      variant: "section",
    } satisfies Partial<SectionProps>,
    props,
  );

  const rest = omit(
    merged,
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

  const outer = createMemo(() => stylexProps(styles.outer, merged.xstyle));
  const explicitPaddingVars = createMemo(() => {
    const value = merged.padding == null ? undefined : paddingValues[merged.padding];

    return value == null
      ? {}
      : {
          "--layout-padding-outer-x": value,
          "--layout-padding-outer-y": value,
          "--layout-padding-inner-x": value,
          "--layout-padding-inner-y": value,
        };
  });

  const theme = createMemo(() => themeProps("section", { variant: merged.variant }));
  const style = createMemo(() =>
    stylexProps(
      styles.inner,
      merged.padding == null && styles.defaultPadding,
      styles[merged.variant],
      merged.padding != null && paddingStyles[merged.padding],
      merged.padding != null && containerPaddingInlineVarStyles[merged.padding],
      merged.padding != null && containerPaddingBlockStartVarStyles[merged.padding],
      merged.padding != null && containerPaddingBlockEndVarStyles[merged.padding],
      merged.padding != null && sectionPaddingPropagationStyles[merged.padding],
      merged.paddingBlock != null && paddingBlockStyles[merged.paddingBlock],
      merged.paddingBlock != null && containerPaddingBlockStartVarStyles[merged.paddingBlock],
      merged.paddingBlock != null && containerPaddingBlockEndVarStyles[merged.paddingBlock],
      merged.dividers?.includes("top") && styles.top,
      merged.dividers?.includes("bottom") && styles.bottom,
      merged.dividers?.includes("start") && styles.start,
      merged.dividers?.includes("end") && styles.end,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, outer().class, merged.class]}
      style={{
        ...outer().style,
        ...(merged.width != null && { width: size(merged.width) }),
        ...(merged.height != null && { height: size(merged.height) }),
        ...(merged.maxWidth != null && { "max-width": size(merged.maxWidth) }),
        ...(merged.minHeight != null && { "min-height": size(merged.minHeight) }),
        ...explicitPaddingVars(),
        ...merged.style,
      }}
      data-style-src={outer()["data-style-src"]}
    >
      <div class={style().class} style={style().style} data-style-src={style()["data-style-src"]}>
        {merged.children}
      </div>
    </div>
  );
}
