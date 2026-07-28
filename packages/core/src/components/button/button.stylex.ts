import * as stylex from "@stylexjs/stylex";

import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex.ts";

/**
 * Base button styles
 * Pseudo-classes are nested within properties per StyleX recommendation:
 * https://stylexjs.com/docs/learn/styling-ui/defining-styles#pseudo-classes
 */
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
    transform: {
      default: "scale(1)",
      ":active": "scale(0.98)",
    },
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
    backgroundImage: "none",
    transform: {
      default: "none",
      ":active": "none",
    },
  },
  ariaDisabled: {
    backgroundImage: {
      default: "none",
      ":hover": {
        "@media (hover: hover)": "none",
      },
      ":active": "none",
    },
  },
  iconOnly: {
    "--button-icon-only-aspect": "1 / 1",
    aspectRatio: "var(--button-icon-only-aspect)",
    paddingInline: 0,
    paddingBlock: 0,
  },
  endContentWrapper: {
    display: "inline-flex",
    alignItems: "center",
    color: "inherit",
  },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  labelText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },
});

export const loadingStyles = stylex.create({
  overlay: { position: "absolute", inset: 0, "place-items": "center" },
});

export const groupStyles = stylex.create({
  horizontal: {
    "border-start-start-radius": { default: 0, ":first-child": radiusVars["--radius-element"] },
    "border-end-start-radius": { default: 0, ":first-child": radiusVars["--radius-element"] },
    "border-start-end-radius": { default: 0, ":last-child": radiusVars["--radius-element"] },
    "border-end-end-radius": { default: 0, ":last-child": radiusVars["--radius-element"] },
    "border-inline-start": {
      default: `${borderVars["--border-width"]} solid ${colorVars["--color-border"]}`,
      ":first-child": "none",
    },
  },
  vertical: {
    "border-start-start-radius": { default: 0, ":first-child": radiusVars["--radius-element"] },
    "border-start-end-radius": { default: 0, ":first-child": radiusVars["--radius-element"] },
    "border-end-start-radius": { default: 0, ":last-child": radiusVars["--radius-element"] },
    "border-end-end-radius": { default: 0, ":last-child": radiusVars["--radius-element"] },
    "border-block-start": {
      default: `${borderVars["--border-width"]} solid ${colorVars["--color-border"]}`,
      ":first-child": "none",
    },
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
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
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
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
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
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
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
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-error"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
  },
});
