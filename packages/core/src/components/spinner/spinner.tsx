import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, durationVars, spacingVars } from "../../theme/tokens.stylex";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";

const rotation = stylex.keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});
const sizes = { sm: 14, md: 20, lg: 24, xl: 36 };

export type SpinnerSize = keyof typeof sizes;
export type SpinnerShade = "default" | "onMedia" | "subtle" | "inherit";
export interface SpinnerProps extends BaseProps<HTMLSpanElement | HTMLDivElement> {
  size?: SpinnerSize;
  shade?: SpinnerShade;
  label?: JSX.Element;
}
const styles = stylex.create({
  wrapper: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacingVars["--spacing-2"],
  },
  spinner: {
    display: "inline-block",
    borderStyle: "solid",
    borderRadius: "50%",
    borderColor: colorVars["--color-track"],
    borderTopColor: colorVars["--color-accent"],
    animationName: rotation,
    animationDuration: {
      default: durationVars["--duration-slow-min"],
      "@media (prefers-reduced-motion: reduce)": "3s",
    },
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  onMedia: {
    borderColor: "color-mix(in srgb, currentColor 30%, transparent)",
    borderTopColor: colorVars["--color-on-dark"],
  },
  subtle: { borderTopColor: colorVars["--color-text-secondary"] },
  inherit: {
    borderColor: "color-mix(in srgb, currentColor 30%, transparent)",
    borderTopColor: "currentColor",
  },
});
export function Spinner(props: SpinnerProps) {
  const size = () => props.size ?? "md";
  const shade = () => props.shade ?? "default";
  const hasLabel = () => props.label != null;

  const rest = omit(
    props,
    "size",
    "shade",
    "label",
    "xstyle",
    "class",
    "style",
    "aria-label",
    "ref",
  );
  const spinnerStyle = createMemo(() =>
    stylexProps(
      styles.spinner,
      shade() === "onMedia" && styles.onMedia,
      shade() === "subtle" && styles.subtle,
      shade() === "inherit" && styles.inherit,
    ),
  );
  const theme = createMemo(() => themeProps("spinner", { size: size(), shade: shade() }));
  const wrapperStyle = createMemo(() => stylexProps(styles.wrapper, props.xstyle));
  const frame = () => sizes[size()];
  const rootRef = (element: HTMLSpanElement | HTMLDivElement) => setElementRef(props.ref, element);
  const indicator = (isRoot: boolean) => (
    <span
      {...(isRoot ? rest : {})}
      {...(isRoot ? theme() : {})}
      ref={isRoot ? rootRef : undefined}
      role="status"
      aria-label={
        props["aria-label"] ?? (typeof props.label === "string" ? props.label : "Loading")
      }
      class={isRoot ? [theme().class, spinnerStyle().class, props.class] : spinnerStyle().class}
      style={{
        ...spinnerStyle().style,
        width: `${frame()}px`,
        height: `${frame()}px`,
        "border-width": `${Math.max(2, Math.round(frame() / 6))}px`,
        ...(isRoot ? props.style : {}),
      }}
      data-style-src={spinnerStyle()["data-style-src"]}
    />
  );

  return (
    <Show when={hasLabel()} fallback={indicator(true)}>
      <div
        {...rest}
        {...theme()}
        ref={rootRef}
        class={[theme().class, wrapperStyle().class, props.class]}
        style={{ ...wrapperStyle().style, ...props.style }}
      >
        {indicator(false)}
        {props.label}
      </div>
    </Show>
  );
}
