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

export type GridColumns =
  | number
  | {
      minWidth: number;
      max?: number;
      repeat?: "fill" | "fit";
    };

/** Compatibility shape for the pre-port responsive prop. Prefer `columns`. */
export interface GridResponsiveColumns {
  minColumnWidth: number;
  maxColumns?: number;
  mode?: "auto-fill" | "auto-fit";
}

export interface GridProps extends BaseProps<HTMLDivElement> {
  columns?: GridColumns;
  /** @deprecated Use `columns={{ minWidth: ... }}` instead. */
  minChildWidth?: number;
  /** @deprecated Use `columns={{ minWidth, max, repeat }}` instead. */
  responsive?: GridResponsiveColumns;
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

const spacingVarNames: Record<SpacingStep, string> = {
  0: "--spacing-0",
  0.5: "--spacing-0-5",
  1: "--spacing-1",
  1.5: "--spacing-1-5",
  2: "--spacing-2",
  3: "--spacing-3",
  4: "--spacing-4",
  5: "--spacing-5",
  6: "--spacing-6",
  8: "--spacing-8",
  10: "--spacing-10",
};

function positiveInteger(value: number | undefined, fallback: number) {
  return value != null && Number.isInteger(value) && value > 0 ? value : fallback;
}

function cappedTemplate(
  minWidth: number,
  max: number,
  repeat: "auto-fill" | "auto-fit",
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
) {
  const gapVar =
    columnGap != null ? spacingVarNames[columnGap] : gap != null ? spacingVarNames[gap] : null;
  const perColumn = gapVar
    ? `calc((100% - ${max - 1} * var(${gapVar})) / ${max})`
    : `calc(100% / ${max})`;

  return `repeat(${repeat}, minmax(min(100%, max(${minWidth}px, ${perColumn})), 1fr))`;
}

function responsiveTemplate(
  columns: Exclude<GridColumns, number>,
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
) {
  const repeat = columns.repeat === "fit" ? "auto-fit" : "auto-fill";
  const minWidth = Number.isFinite(columns.minWidth) && columns.minWidth > 0 ? columns.minWidth : 1;
  const max = columns.max != null && columns.max > 0 ? positiveInteger(columns.max, 1) : undefined;

  return max == null
    ? `repeat(${repeat}, minmax(${minWidth}px, 1fr))`
    : cappedTemplate(minWidth, max, repeat, gap, columnGap);
}

function gridTemplate(props: GridProps) {
  if (props.responsive != null) {
    const repeat = props.responsive.mode ?? "auto-fit";
    const minWidth =
      Number.isFinite(props.responsive.minColumnWidth) && props.responsive.minColumnWidth > 0
        ? props.responsive.minColumnWidth
        : 1;
    const max = props.responsive.maxColumns;

    return max != null && max > 0
      ? cappedTemplate(minWidth, positiveInteger(max, 1), repeat, props.gap, props.columnGap)
      : `repeat(${repeat}, minmax(${minWidth}px, 1fr))`;
  }

  if (typeof props.columns === "object" && props.columns != null)
    return responsiveTemplate(props.columns, props.gap, props.columnGap);

  if (props.minChildWidth != null && props.minChildWidth > 0) {
    return props.columns != null && props.columns > 0
      ? cappedTemplate(props.minChildWidth, props.columns, "auto-fit", props.gap, props.columnGap)
      : `repeat(auto-fit, minmax(${props.minChildWidth}px, 1fr))`;
  }

  const columns = positiveInteger(props.columns, 0);

  return columns > 0 ? `repeat(${columns}, 1fr)` : "1fr";
}

/** CSS-grid container with fixed or responsive columns. */
export function Grid(props: GridProps) {
  const rest = omit(
    props,
    "columns",
    "minChildWidth",
    "responsive",
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

  const template = createMemo(() => gridTemplate(props));
  const validRowHeight = createMemo(() =>
    props.rowHeight != null && Number.isFinite(props.rowHeight) && props.rowHeight > 0
      ? props.rowHeight
      : undefined,
  );

  const style = createMemo(() =>
    stylexProps(
      styles.grid,
      styles.template(template()),
      validRowHeight() != null && styles.rows(validRowHeight() ?? 1),
      props.gap != null && styles.gap(spacing[props.gap]),
      props.rowGap != null && styles.rowGap(spacing[props.rowGap]),
      props.columnGap != null && styles.columnGap(spacing[props.columnGap]),
      props.align != null && alignStyles[props.align],
      props.justify != null && justifyStyles[props.justify],
      props.xstyle,
    ),
  );
  const theme = createMemo(() =>
    themeProps("grid", {
      columns: typeof props.columns === "number" ? props.columns : undefined,
      gap: props.gap,
      align: props.align,
      justify: props.justify,
    }),
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
