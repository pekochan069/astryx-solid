import * as stylex from "@stylexjs/stylex";

import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from "../../theme/tokens.stylex.ts";

export const styles = stylex.create({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingVars["--spacing-2"],
    paddingBlock: spacingVars["--spacing-2"],
    paddingInline: spacingVars["--spacing-3"],
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: `var(--_button-radius, ${radiusVars["--radius-element"]})`,
    fontFamily: "inherit",
    fontSize: typeScaleVars["--text-label-size"],
    lineHeight: typeScaleVars["--text-label-leading"],
    fontWeight: fontWeightVars["--font-weight-medium"],
    whiteSpace: "nowrap",
    cursor: "pointer",
    transitionProperty: "background-image, background-color, color, opacity, transform",
    transitionDuration: {
      default: durationVars["--duration-fast"],
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  pressable: {
    transform: { default: "scale(1)", ":active": "scale(0.98)" },
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
    backgroundImage: "none",
    transform: { default: "none", ":active": "none" },
  },
  ariaDisabled: {
    backgroundImage: {
      default: "none",
      ":hover": { "@media (hover: hover)": "none" },
      ":active": "none",
    },
  },
  iconOnly: {
    "--button-icon-only-aspect": "1 / 1",
    aspectRatio: "var(--button-icon-only-aspect)",
    paddingInline: 0,
    paddingBlock: 0,
  },
  endContentWrapper: { display: "inline-flex", alignItems: "center", color: "inherit" },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contentWrapper: { display: "contents" },
  labelText: { overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 },
  link: { textDecoration: "none" },
  tooltip: {
    position: "fixed",
    margin: 0,
    marginBlockEnd: spacingVars["--spacing-1"],
    paddingBlock: spacingVars["--spacing-1"],
    paddingInline: spacingVars["--spacing-2"],
    maxWidth: 300,
    borderWidth: 0,
    borderRadius: radiusVars["--radius-container"],
    backgroundColor: colorVars["--color-text-primary"],
    color: colorVars["--color-background-surface"],
    fontFamily: typographyVars["--font-family-body"],
    fontSize: typeScaleVars["--text-body-size"],
    lineHeight: typeScaleVars["--text-body-leading"],
    wordBreak: "break-word",
  },
});

export const sizeStyles = stylex.create({
  sm: { height: sizeVars["--size-element-sm"] },
  md: { height: sizeVars["--size-element-md"] },
  lg: { height: sizeVars["--size-element-lg"] },
});

export const iconSizeStyles = stylex.create({
  sm: { width: 16, height: 16, fontSize: 16 },
  md: { width: 16, height: 16, fontSize: 16 },
  lg: { width: 20, height: 20, fontSize: 20 },
});

export const elevationStyles = stylex.create({
  none: { boxShadow: "none" },
  low: { boxShadow: shadowVars["--shadow-low"] },
  med: { boxShadow: shadowVars["--shadow-med"] },
  high: { boxShadow: shadowVars["--shadow-high"] },
});

export const variants = stylex.create({
  primary: {
    backgroundColor: colorVars["--color-accent"],
    color: colorVars["--color-on-accent"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-accent"]}` },
    "--button-focus-offset": "3px",
    outlineOffset: { default: "0", ":focus-visible": "var(--button-focus-offset)" },
  },
  secondary: {
    backgroundColor: colorVars["--color-neutral"],
    color: colorVars["--color-text-primary"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-accent"]}` },
    "--button-focus-offset": "3px",
    outlineOffset: { default: "0", ":focus-visible": "var(--button-focus-offset)" },
  },
  ghost: {
    backgroundColor: "transparent",
    color: colorVars["--color-text-primary"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-accent"]}` },
    "--button-focus-offset": "3px",
    outlineOffset: { default: "0", ":focus-visible": "var(--button-focus-offset)" },
  },
  destructive: {
    backgroundColor: colorVars["--color-error"],
    color: colorVars["--color-on-error"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-error"]}` },
    "--button-focus-offset": "3px",
    outlineOffset: { default: "0", ":focus-visible": "var(--button-focus-offset)" },
  },
});

const spinnerReveal = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const contentHide = stylex.keyframes({ from: { color: "inherit" }, to: { color: "transparent" } });
const SPINNER_DELAY = durationVars["--duration-medium-min"];

export const loadingStyles = stylex.create({
  hiddenContent: { color: "transparent" },
  hiddenContentDelayed: {
    animationName: contentHide,
    animationDuration: "1ms",
    animationFillMode: "forwards",
    animationDelay: {
      default: SPINNER_DELAY,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
  },
  spinnerOverlay: {
    position: "absolute",
    top: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    bottom: 0,
    display: "grid",
    placeItems: "center",
  },
  spinnerDelayed: {
    animationName: spinnerReveal,
    animationDuration: durationVars["--duration-fast"],
    animationFillMode: "backwards",
    animationDelay: {
      default: SPINNER_DELAY,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
  },
});

const IS_LAST_ITEM = ":not(:has(~ *:not([popover])))";

export const groupStyles = stylex.create({
  horizontal: {
    borderStartStartRadius: { default: 0, ":first-child": radiusVars["--radius-element"] },
    borderEndStartRadius: { default: 0, ":first-child": radiusVars["--radius-element"] },
    borderStartEndRadius: { default: 0, [IS_LAST_ITEM]: radiusVars["--radius-element"] },
    borderEndEndRadius: { default: 0, [IS_LAST_ITEM]: radiusVars["--radius-element"] },
    borderInlineStartWidth: { default: borderVars["--border-width"], ":first-child": 0 },
    borderInlineStartStyle: { default: "solid", ":first-child": "none" },
    borderInlineStartColor: colorVars["--color-border"],
  },
  vertical: {
    borderStartStartRadius: { default: 0, ":first-child": radiusVars["--radius-element"] },
    borderStartEndRadius: { default: 0, ":first-child": radiusVars["--radius-element"] },
    borderEndStartRadius: { default: 0, [IS_LAST_ITEM]: radiusVars["--radius-element"] },
    borderEndEndRadius: { default: 0, [IS_LAST_ITEM]: radiusVars["--radius-element"] },
    borderBlockStartWidth: { default: borderVars["--border-width"], ":first-child": 0 },
    borderBlockStartStyle: { default: "solid", ":first-child": "none" },
    borderBlockStartColor: colorVars["--color-border"],
  },
  onSolidHorizontal: { borderInlineStartColor: colorVars["--color-on-accent"] },
  onSolidVertical: { borderBlockStartColor: colorVars["--color-on-accent"] },
});
