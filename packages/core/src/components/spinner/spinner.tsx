import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createEffect, createMemo, merge, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { resolveThemeTokens } from "../../theme/tokens";
import { durationVars, spacingVars } from "../../theme/tokens.stylex";
import { useTheme, type UseThemeReturn } from "../../theme/use-theme";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";
import { Text } from "../text/text";

const SPREAD = 0.75;
const START_POINT = 1.5;
const sizes = {
  sm: { diameter: 10, border: 2 },
  md: { diameter: 14, border: 3 },
  lg: { diameter: 18, border: 3 },
  xl: { diameter: 28, border: 4 },
};

export type SpinnerSize = keyof typeof sizes;
export type SpinnerShade = "default" | "onMedia" | "subtle" | "inherit";

export interface SpinnerProps extends BaseProps<HTMLSpanElement | HTMLDivElement> {
  size?: SpinnerSize;
  shade?: SpinnerShade;
  label?: JSX.Element;
}

const rotation = stylex.keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

const styles = stylex.create({
  wrapper: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacingVars["--spacing-2"],
  },
  spinner: {
    display: "inline-grid",
    placeItems: "center",
    overflow: "hidden",
    verticalAlign: "middle",
  },
  canvas: {
    backfaceVisibility: "hidden",
    display: "block",
    willChange: "transform",
    animationDuration: {
      default: durationVars["--duration-slow-min"],
      "@media (prefers-reduced-motion: reduce)": "3s",
    },
    animationIterationCount: "infinite",
    animationName: rotation,
    animationTimingFunction: "linear",
  },
});

function drawSpinner(
  canvas: HTMLCanvasElement,
  size: SpinnerSize,
  shade: SpinnerShade,
  tokens: Record<string, string>,
) {
  const context = canvas.getContext("2d");

  if (context === null) {
    return;
  }

  const { border, diameter } = sizes[size];
  const pixelRatio = window.devicePixelRatio || 1;
  const inheritedColor = shade === "inherit" ? getComputedStyle(canvas).color : null;
  const activeColor =
    shade === "inherit"
      ? inheritedColor
      : shade === "onMedia"
        ? tokens["--color-on-dark"]
        : shade === "subtle"
          ? tokens["--color-text-secondary"]
          : tokens["--color-accent"];
  const backgroundColor =
    shade === "inherit"
      ? inheritedColor
      : shade === "onMedia"
        ? `${tokens["--color-on-dark"]}4D`
        : tokens["--color-track"];
  const cssSize = diameter + border * 2;
  const rawFrameSize = Math.round(cssSize * pixelRatio);
  const frameSize = rawFrameSize + (rawFrameSize % 2);
  const scale = frameSize / cssSize;
  const radius = (diameter / 2) * scale;
  const lineWidth = border * scale;
  const center = frameSize / 2;

  canvas.height = canvas.width = frameSize;
  canvas.style.width = `${cssSize}px`;
  canvas.style.height = `${cssSize}px`;
  context.lineCap = "round";
  context.lineWidth = lineWidth;

  context.beginPath();
  context.arc(center, center, radius, 0, 2 * Math.PI);
  context.strokeStyle = backgroundColor ?? "";
  context.globalAlpha = shade === "inherit" ? 0.3 : 1;
  context.stroke();
  context.globalAlpha = 1;

  context.beginPath();
  context.arc(
    center,
    center,
    radius,
    START_POINT * Math.PI,
    ((START_POINT + SPREAD) % 2) * Math.PI,
  );
  context.strokeStyle = activeColor ?? "";
  context.stroke();
}

interface SpinnerCanvasProps {
  size: SpinnerSize;
  shade: SpinnerShade;
}

function fallbackThemeTokens() {
  const mode =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  return resolveThemeTokens(undefined, { mode });
}

function SpinnerCanvas(props: SpinnerCanvasProps) {
  let theme: UseThemeReturn | undefined;

  try {
    theme = useTheme();
  } catch {
    theme = undefined;
  }

  let canvas: HTMLCanvasElement | undefined;

  createEffect(
    () => ({
      element: canvas,
      size: props.size,
      shade: props.shade,
      tokens: theme?.tokens ?? fallbackThemeTokens(),
    }),
    ({ element, size, shade, tokens }) => {
      if (element !== undefined) drawSpinner(element, size, shade, tokens);
    },
  );

  return <canvas ref={(element) => (canvas = element)} {...stylexProps(styles.canvas)} />;
}

export function Spinner(props: SpinnerProps) {
  const merged = merge({ size: "md", shade: "default" } satisfies Partial<SpinnerProps>, props);
  const rest = omit(
    merged,
    "size",
    "shade",
    "label",
    "xstyle",
    "class",
    "style",
    "aria-label",
    "ref",
  );

  const rootRef = (element: HTMLSpanElement | HTMLDivElement) => setElementRef(merged.ref, element);

  const frameSize = () => sizes[merged.size].diameter + sizes[merged.size].border * 2;
  const ariaLabel = () =>
    merged["aria-label"] ?? (typeof merged.label === "string" ? merged.label : "Loading");

  const theme = createMemo(() => themeProps("spinner", { size: merged.size, shade: merged.shade }));
  const spinnerStyle = createMemo(() =>
    stylexProps(styles.spinner, merged.label == null && merged.xstyle),
  );
  const wrapperStyle = createMemo(() => stylexProps(styles.wrapper, merged.xstyle));

  return (
    <Show
      when={merged.label != null}
      fallback={
        <span
          {...rest}
          {...theme()}
          ref={rootRef}
          role="status"
          aria-label={ariaLabel()}
          class={[theme().class, spinnerStyle().class, merged.class]}
          style={{
            ...spinnerStyle().style,
            ...merged.style,
            width: `${frameSize()}px`,
            height: `${frameSize()}px`,
          }}
          data-style-src={spinnerStyle()["data-style-src"]}
        >
          <SpinnerCanvas size={merged.size} shade={merged.shade} />
        </span>
      }
    >
      <div
        {...rest}
        {...theme()}
        ref={rootRef}
        class={[theme().class, wrapperStyle().class, merged.class]}
        style={{ ...wrapperStyle().style, ...merged.style }}
        data-style-src={wrapperStyle()["data-style-src"]}
      >
        <span
          role="status"
          aria-label={ariaLabel()}
          class={spinnerStyle().class}
          style={{ width: `${frameSize()}px`, height: `${frameSize()}px` }}
          data-style-src={spinnerStyle()["data-style-src"]}
        >
          <SpinnerCanvas size={merged.size} shade={merged.shade} />
        </span>
        <Show
          when={typeof merged.label === "string" ? merged.label : undefined}
          fallback={merged.label}
        >
          {(label) => <Text type="body" weight="bold" textContent={label()} />}
        </Show>
      </div>
    </Show>
  );
}
