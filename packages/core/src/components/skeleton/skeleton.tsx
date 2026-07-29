import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, durationVars, radiusVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

const pulse = stylex.keyframes({ "0%": { opacity: 0.25 }, "100%": { opacity: 1 } });

const styles = stylex.create({
  root: {
    backgroundColor: {
      default: colorVars["--color-skeleton"],
      "@media (prefers-contrast: more)": `color-mix(in srgb, ${colorVars["--color-skeleton"]}, ${colorVars["--color-text-primary"]} 30%)`,
    },
    opacity: 0.25,
  },
  animate: {
    animationName: { default: pulse, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDirection: "alternate",
    animationDuration: durationVars["--duration-medium-max"],
    animationIterationCount: "infinite",
    animationTimingFunction: "steps(10, end)",
  },
});

const radiusStyles = stylex.create({
  none: { borderRadius: 0 },
  0: { borderRadius: radiusVars["--radius-none"] },
  1: { borderRadius: radiusVars["--radius-inner"] },
  2: { borderRadius: radiusVars["--radius-element"] },
  3: { borderRadius: radiusVars["--radius-container"] },
  4: { borderRadius: radiusVars["--radius-container"] },
  rounded: { borderRadius: radiusVars["--radius-full"] },
});

export type SkeletonRadius = keyof typeof radiusStyles;

export interface SkeletonProps extends BaseProps<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  radius?: SkeletonRadius;
  index?: number;
}

export function Skeleton(props: SkeletonProps) {
  const merged = merge({ radius: 3 } satisfies Partial<SkeletonProps>, props);

  const rest = omit(merged, "width", "height", "radius", "index", "xstyle", "class", "style");

  const theme = createMemo(() => themeProps("skeleton"));
  const style = createMemo(() =>
    stylexProps(styles.root, styles.animate, radiusStyles[merged.radius], merged.xstyle),
  );

  return (
    <div
      {...rest}
      {...theme()}
      aria-hidden={merged["aria-hidden"] === false ? "false" : (merged["aria-hidden"] ?? "true")}
      class={[theme().class, style().class, merged.class]}
      style={{
        ...style().style,
        width: typeof merged.width === "number" ? `${merged.width}px` : (merged.width ?? "100%"),
        height:
          typeof merged.height === "number" ? `${merged.height}px` : (merged.height ?? "100%"),
        "animation-delay": `${1000 + 100 * (merged.index ?? 0)}ms`,
        ...merged.style,
      }}
      data-style-src={style()["data-style-src"]}
    />
  );
}
