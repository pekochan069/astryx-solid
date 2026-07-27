import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, durationVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export type StatusDotVariant = "success" | "warning" | "error" | "accent" | "neutral";

export interface StatusDotProps extends BaseProps<HTMLSpanElement> {
  variant: StatusDotVariant;
  label: string;
  isPulsing?: boolean;
  tooltip?: string;
}

const pulse = stylex.keyframes({
  "0%": { opacity: 1 },
  "50%": { opacity: 0.5 },
  "100%": { opacity: 1 },
});

const styles = stylex.create({
  root: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  pulsing: {
    animationName: { default: pulse, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: durationVars["--duration-slow-min"],
    animationIterationCount: "infinite",
  },
  success: { backgroundColor: colorVars["--color-success"] },
  warning: { backgroundColor: colorVars["--color-warning"] },
  error: { backgroundColor: colorVars["--color-error"] },
  accent: { backgroundColor: colorVars["--color-accent"] },
  neutral: { backgroundColor: colorVars["--color-icon-secondary"] },
});

export function StatusDot(props: StatusDotProps) {
  const rest = omit(props, "variant", "label", "isPulsing", "tooltip", "xstyle", "class", "style");

  const theme = createMemo(() => themeProps("statusdot", { variant: props.variant }));
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      styles[props.variant],
      props.isPulsing && styles.pulsing,
      props.xstyle,
    ),
  );

  return (
    <span
      {...rest}
      {...theme()}
      role="img"
      aria-label={props.label}
      title={props.tooltip}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    />
  );
}
