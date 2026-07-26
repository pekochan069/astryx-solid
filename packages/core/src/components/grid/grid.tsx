import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";
import type { SpacingStep } from "../../types/spacing-steps.types";

import { stylexProps } from "../../stylex";
import { spacingVars } from "../../theme/tokens.stylex";
import { size } from "../../utils/size";
import { themeProps } from "../../utils/theme-props";

export type GridAlignment = "start" | "center" | "end" | "stretch";
export type GridColumns = number | { minWidth: number; max?: number; repeat?: "fill" | "fit" };

export interface GridProps extends BaseProps<HTMLDivElement> {
  columns?: GridColumns;
  minChildWidth?: number;
  rowHeight?: number;
  width?: SizeValue;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  gap?: SpacingStep;
  rowGap?: SpacingStep;
  columnGap?: SpacingStep;
  align?: GridAlignment;
  justify?: GridAlignment;
  children?: JSX.Element;
}

const styles = stylex.create({
  grid: { display: "grid" },
  template: (value: string) => ({ gridTemplateColumns: value }),
  rows: (value: number) => ({ gridAutoRows: `${value}px` }),
  alignStart: { alignItems: "start" },
  alignCenter: { alignItems: "center" },
  alignEnd: { alignItems: "end" },
  alignStretch: { alignItems: "stretch" },
  justifyStart: { justifyItems: "start" },
  justifyCenter: { justifyItems: "center" },
  justifyEnd: { justifyItems: "end" },
  justifyStretch: { justifyItems: "stretch" },
  gap: (value: string) => ({ gap: value }),
  rowGap: (value: string) => ({ rowGap: value }),
  columnGap: (value: string) => ({ columnGap: value }),
});

const alignStyles = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
};
const justifyStyles = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  stretch: styles.justifyStretch,
};

const spacing: Record<SpacingStep, string> = {
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

/** CSS-grid container with fixed or responsive columns. */
export function Grid(props: GridProps) {
  const rest = omit(
    props,
    "columns",
    "minChildWidth",
    "rowHeight",
    "width",
    "height",
    "maxWidth",
    "minHeight",
    "gap",
    "rowGap",
    "columnGap",
    "align",
    "justify",
    "xstyle",
    "class",
    "style",
    "children",
  );

  const template = createMemo(() =>
    gridTemplate(props.columns, props.minChildWidth, props.gap, props.columnGap),
  );

  const theme = createMemo(() =>
    themeProps("grid", {
      columns: typeof props.columns === "number" ? props.columns : undefined,
      gap: props.gap,
      align: props.align,
      justify: props.justify,
    }),
  );
  const style = createMemo(() =>
    stylexProps(
      styles.grid,
      styles.template(template()),
      props.rowHeight != null && styles.rows(props.rowHeight),
      props.gap != null && styles.gap(spacing[props.gap]),
      props.rowGap != null && styles.rowGap(spacing[props.rowGap]),
      props.columnGap != null && styles.columnGap(spacing[props.columnGap]),
      props.align != null && alignStyles[props.align],
      props.justify != null && justifyStyles[props.justify],
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

function gridTemplate(
  columns: GridColumns | undefined,
  minChildWidth: number | undefined,
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
) {
  if (typeof columns === "object") return responsiveTemplate(columns, gap, columnGap);
  if (minChildWidth != null && minChildWidth > 0)
    return columns != null && columns > 0
      ? cappedTemplate(minChildWidth, columns, "auto-fit", gap, columnGap)
      : `repeat(auto-fit, minmax(${minChildWidth}px, 1fr))`;
  return columns != null && columns > 0 ? `repeat(${columns}, 1fr)` : "1fr";
}

function responsiveTemplate(
  columns: Exclude<GridColumns, number>,
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
) {
  const repeat = columns.repeat === "fit" ? "auto-fit" : "auto-fill";
  return columns.max != null && columns.max > 0
    ? cappedTemplate(columns.minWidth, columns.max, repeat, gap, columnGap)
    : `repeat(${repeat}, minmax(${columns.minWidth}px, 1fr))`;
}

function cappedTemplate(
  minWidth: number,
  max: number,
  repeat: "auto-fill" | "auto-fit",
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
) {
  const chosenGap = columnGap ?? gap;
  const perColumn =
    chosenGap == null
      ? `calc(100% / ${max})`
      : `calc((100% - ${max - 1} * var(--spacing-${String(chosenGap).replace(".", "-")})) / ${max})`;
  return `repeat(${repeat}, minmax(min(100%, max(${minWidth}px, ${perColumn})), 1fr))`;
}
