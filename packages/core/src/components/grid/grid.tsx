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

export interface GridResponsiveColumns {
  minColumnWidth: number;
  maxColumns?: number;
  mode?: "auto-fill" | "auto-fit";
}

interface GridCommonProps extends BaseProps<HTMLDivElement> {
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

export interface GridFixedProps extends GridCommonProps {
  columns?: number;
  responsive?: never;
}

export interface GridResponsiveProps extends GridCommonProps {
  columns?: never;
  responsive: GridResponsiveColumns;
}

export type GridProps = GridFixedProps | GridResponsiveProps;

const styles = stylex.create({
  grid: { display: "grid" },
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

function positiveInteger(value: number | undefined, fallback: number) {
  return value != null && Number.isInteger(value) && value > 0 ? value : fallback;
}

function responsiveTemplate(
  responsive: GridResponsiveColumns,
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
) {
  const minWidth =
    Number.isFinite(responsive.minColumnWidth) && responsive.minColumnWidth > 0
      ? responsive.minColumnWidth
      : 1;
  const mode = responsive.mode ?? "auto-fit";
  const maxColumns =
    responsive.maxColumns == null ? undefined : positiveInteger(responsive.maxColumns, 1);
  const chosenGap = columnGap ?? gap;
  const cappedWidth =
    maxColumns == null
      ? `${minWidth}px`
      : chosenGap == null
        ? `max(${minWidth}px, calc(100% / ${maxColumns}))`
        : `max(${minWidth}px, calc((100% - (${maxColumns - 1} * ${spacing[chosenGap]})) / ${maxColumns}))`;

  return `repeat(${mode}, minmax(min(100%, ${cappedWidth}), 1fr))`;
}

function gridTemplate(props: GridProps) {
  return props.responsive == null
    ? `repeat(${positiveInteger(props.columns, 1)}, 1fr)`
    : responsiveTemplate(props.responsive, props.gap, props.columnGap);
}

/** CSS-grid container with fixed or responsive columns. */
export function Grid(props: GridProps) {
  const rest = omit(
    props,
    "columns",
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

  const theme = createMemo(() =>
    themeProps("grid", {
      columns: props.responsive == null ? positiveInteger(props.columns, 1) : undefined,
      responsive: props.responsive != null ? "true" : undefined,
      gap: props.gap,
      align: props.align,
      justify: props.justify,
    }),
  );
  const style = createMemo(() =>
    stylexProps(
      styles.grid,
      validRowHeight() != null && styles.rows(validRowHeight() ?? 1),
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
        "grid-template-columns": template(),
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
