import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";

import { stylexProps } from "../../stylex";
import { colorVars, durationVars, easeVars, spacingVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { overlayScope } from "./overlay.markers.stylex";

export type OverlayScrimMode = "dark" | "light" | false;
export type OverlayPosition = "fill" | "bottom" | "top";
export type OverlayAlign = "start" | "center" | "end";
export type OverlayShowOn = "hover" | "always" | "focus" | "hover-or-focus";

export interface OverlayScrimProps {
  scrim: OverlayScrimMode;
  position: OverlayPosition;
  align: OverlayAlign;
  showOn: OverlayShowOn;
  isOpen: boolean | undefined;
  children: JSX.Element;
}

const styles = stylex.create({
  base: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    gap: spacingVars["--spacing-2"],
    padding: spacingVars["--spacing-3"],
    pointerEvents: "none",
    transitionProperty: "opacity, visibility, transform",
    transitionDuration: {
      default: durationVars["--duration-fast"],
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  fill: { inset: 0 },
  bottom: { insetInline: 0, bottom: 0 },
  top: { insetInline: 0, top: 0 },
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  dark: { backgroundColor: colorVars["--color-overlay"] },
  light: { backgroundColor: "color-mix(in srgb, white 60%, transparent)" },
  visible: { opacity: 1, visibility: "visible", pointerEvents: "auto", transform: "translateY(0)" },
  hidden: { opacity: 0, visibility: "hidden" },
  hiddenTop: { transform: "translateY(-100%)" },
  hiddenBottom: { transform: "translateY(100%)" },
  hover: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover", overlayScope)]: { "@media (hover: hover)": 1 },
      [stylex.when.ancestor(":focus-within", overlayScope)]: 1,
    },
    visibility: {
      default: "hidden",
      [stylex.when.ancestor(":hover", overlayScope)]: { "@media (hover: hover)": "visible" },
      [stylex.when.ancestor(":focus-within", overlayScope)]: "visible",
    },
    pointerEvents: {
      default: "none",
      [stylex.when.ancestor(":hover", overlayScope)]: { "@media (hover: hover)": "auto" },
      [stylex.when.ancestor(":focus-within", overlayScope)]: "auto",
    },
  },
  focus: {
    opacity: { default: 0, [stylex.when.ancestor(":focus-within", overlayScope)]: 1 },
    visibility: {
      default: "hidden",
      [stylex.when.ancestor(":focus-within", overlayScope)]: "visible",
    },
    pointerEvents: {
      default: "none",
      [stylex.when.ancestor(":focus-within", overlayScope)]: "auto",
    },
  },
});

export function OverlayScrim(props: OverlayScrimProps) {
  const controlled = () => props.isOpen !== undefined;
  const visible = () => (controlled() ? props.isOpen : props.showOn === "always");
  const reveal = () =>
    controlled()
      ? props.isOpen
        ? styles.visible
        : styles.hidden
      : props.showOn === "focus"
        ? styles.focus
        : props.showOn === "always"
          ? styles.visible
          : styles.hover;

  return (
    <div
      {...themeProps("overlay-scrim", { position: props.position })}
      data-astryx-solid-media={props.scrim || undefined}
      {...stylexProps(
        styles.base,
        styles[props.position],
        styles[props.align],
        props.scrim === "dark" && styles.dark,
        props.scrim === "light" && styles.light,
        reveal(),
        !visible() && props.position === "top" && styles.hiddenTop,
        !visible() && props.position === "bottom" && styles.hiddenBottom,
      )}
      inert={controlled() && !props.isOpen ? true : undefined}
    >
      {props.children}
    </div>
  );
}
