import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, durationVars, radiusVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

const pulse = stylex.keyframes({ "0%": { opacity: 0.25 }, "100%": { opacity: 1 } });

const styles = stylex.create({
  root: { backgroundColor: colorVars["--color-skeleton"], opacity: 0.25 },
  animate: {
    animationName: { default: pulse, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDirection: "alternate",
    animationDuration: durationVars["--duration-medium-max"],
    animationIterationCount: "infinite",
    animationTimingFunction: "steps(10, end)",
  },
  none: { borderRadius: 0 },
  0: { borderRadius: radiusVars["--radius-none"] },
  1: { borderRadius: radiusVars["--radius-inner"] },
  2: { borderRadius: radiusVars["--radius-element"] },
  3: { borderRadius: radiusVars["--radius-container"] },
  4: { borderRadius: radiusVars["--radius-container"] },
  rounded: { borderRadius: radiusVars["--radius-full"] },
});

export type SkeletonRadius = keyof typeof styles;

export interface SkeletonProps extends BaseProps<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  radius?: SkeletonRadius;
  index?: number;
}

export function Skeleton(props: SkeletonProps) {
  const rest = omit(props, "width", "height", "radius", "index", "xstyle", "class", "style");

  const radius = () => props.radius ?? 3;

  const theme = createMemo(() => themeProps("skeleton"));
  const style = createMemo(() =>
    stylexProps(styles.root, styles.animate, styles[radius()], props.xstyle),
  );

  return (
    <div
      {...rest}
      {...theme()}
      aria-hidden={props["aria-hidden"] ?? "true"}
      class={[theme().class, style().class, props.class]}
      style={{
        ...style().style,
        width: typeof props.width === "number" ? `${props.width}px` : (props.width ?? "100%"),
        height: typeof props.height === "number" ? `${props.height}px` : (props.height ?? "100%"),
        "animation-delay": `${1000 + 100 * (props.index ?? 0)}ms`,
        ...props.style,
      }}
      data-style-src={style()["data-style-src"]}
    />
  );
}
