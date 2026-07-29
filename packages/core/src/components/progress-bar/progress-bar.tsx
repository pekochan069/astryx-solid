import * as stylex from "@stylexjs/stylex";
import { createMemo, createUniqueId, merge, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import {
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

export interface ProgressBarVariantMap {
  accent: true;
  success: true;
  warning: true;
  neutral: true;
  error: true;
}

export type ProgressBarVariant = keyof ProgressBarVariantMap;

export interface ProgressBarProps extends BaseProps<HTMLDivElement> {
  value?: number;
  max?: number;
  label: string;
  isLabelHidden?: boolean;
  hasValueLabel?: boolean;
  formatValueLabel?: (value: number, max: number) => string;
  variant?: ProgressBarVariant;
  isIndeterminate?: boolean;
  isDisabled?: boolean;
}

const slide = stylex.keyframes({
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(250%)" },
});

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: spacingVars["--spacing-1"],
    width: "100%",
    minWidth: 48,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  label: {
    fontSize: typeScaleVars["--text-body-size"],
    lineHeight: typeScaleVars["--text-body-leading"],
    fontWeight: fontWeightVars["--font-weight-medium"],
    color: colorVars["--color-text-primary"],
  },
  valueLabel: {
    fontSize: typeScaleVars["--text-body-size"],
    lineHeight: typeScaleVars["--text-body-leading"],
    fontWeight: fontWeightVars["--font-weight-normal"],
    color: colorVars["--color-text-secondary"],
  },
  disabledText: { color: colorVars["--color-text-disabled"] },
  track: {
    width: "100%",
    height: 8,
    backgroundColor: colorVars["--color-background-muted"],
    borderRadius: radiusVars["--radius-full"],
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radiusVars["--radius-full"],
    transitionProperty: "width",
    transitionDuration: durationVars["--duration-medium"],
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  indeterminate: {
    width: "40%",
    animationName: slide,
    animationDuration: { default: "1.5s", "@media (prefers-reduced-motion: reduce)": "3s" },
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  accent: { backgroundColor: colorVars["--color-accent"] },
  success: { backgroundColor: colorVars["--color-success"] },
  warning: { backgroundColor: colorVars["--color-warning"] },
  error: { backgroundColor: colorVars["--color-error"] },
  neutral: { backgroundColor: colorVars["--color-text-disabled"] },
});

export function ProgressBar(props: ProgressBarProps) {
  const merged = merge(
    {
      variant: "accent",
    } satisfies Partial<ProgressBarProps>,
    props,
  );

  const rest = omit(
    merged,
    "value",
    "max",
    "label",
    "isLabelHidden",
    "hasValueLabel",
    "formatValueLabel",
    "variant",
    "isIndeterminate",
    "isDisabled",
    "xstyle",
    "class",
    "style",
  );

  const max = createMemo(() =>
    merged.max == null ? 100 : Number.isFinite(merged.max) && merged.max > 0 ? merged.max : 0,
  );
  const value = createMemo(() =>
    Math.min(Math.max(0, Number.isFinite(merged.value) ? (merged.value ?? 0) : 0), max()),
  );
  const fillVariant = () => (merged.isDisabled ? "neutral" : merged.variant);
  const text = () =>
    merged.formatValueLabel?.(value(), max()) ??
    `${max() > 0 ? Math.round((value() / max()) * 100) : 0}%`;
  const labelId = createUniqueId();

  const theme = createMemo(() => themeProps("progressbar", { variant: merged.variant }));
  const root = createMemo(() => stylexProps(styles.root, props.xstyle));

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, root().class, props.class]}
      style={{ ...root().style, ...props.style }}
      data-style-src={root()["data-style-src"]}
    >
      <Show
        when={!props.isLabelHidden || (props.hasValueLabel && !props.isIndeterminate)}
        fallback={<VisuallyHidden id={labelId} textContent={props.label} />}
      >
        <div {...stylexProps(styles.header)}>
          <Show
            when={!props.isLabelHidden}
            fallback={<VisuallyHidden id={labelId} textContent={props.label} />}
          >
            <span
              id={labelId}
              {...stylexProps(styles.label, props.isDisabled && styles.disabledText)}
              textContent={props.label}
            />
          </Show>
          <Show when={props.hasValueLabel && !props.isIndeterminate}>
            <span
              {...stylexProps(styles.valueLabel, props.isDisabled && styles.disabledText)}
              textContent={text()}
            />
          </Show>
        </div>
      </Show>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuenow={props.isIndeterminate ? undefined : value()}
        aria-valuemin={props.isIndeterminate ? undefined : 0}
        aria-valuemax={props.isIndeterminate ? undefined : max()}
        aria-valuetext={props.isIndeterminate ? undefined : text()}
        aria-disabled={props.isDisabled ? "true" : undefined}
        {...themeProps("progressbar-track")}
        {...stylexProps(styles.track)}
      >
        <div
          {...themeProps("progressbar-fill", { variant: fillVariant() })}
          {...stylexProps(
            styles.fill,
            props.isIndeterminate && styles.indeterminate,
            styles[fillVariant()],
          )}
          style={
            props.isIndeterminate
              ? undefined
              : { width: `${max() > 0 ? (value() / max()) * 100 : 0}%` }
          }
        />
      </div>
    </div>
  );
}
