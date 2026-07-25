import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import {
  colorVars,
  fontWeightVars,
  textSizeVars,
  typeScaleVars,
  typographyVars,
} from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export type TextType =
  | "body"
  | "large"
  | "label"
  | "supporting"
  | "code"
  | "display-1"
  | "display-2"
  | "display-3"
  | "inherit"
  | (string & {});
export type TextSize =
  | "4xs"
  | "3xs"
  | "2xs"
  | "xsm"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";
export type TextColor = "primary" | "secondary" | "disabled" | "placeholder" | "accent" | "inherit";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextDisplay = "inline" | "block";
export type TextJustify = "start" | "center" | "end";
export type WordBreak = "break-word" | "break-all";
export type TextWrap = "wrap" | "nowrap" | "balance" | "pretty";
export interface TextProps extends BaseProps {
  children?: JSX.Element;
  type?: TextType;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  display?: TextDisplay;
  maxLines?: number;
  hasTruncateTooltip?: boolean;
  wordBreak?: WordBreak;
  textWrap?: TextWrap;
  justify?: TextJustify;
  hasCapsize?: boolean;
  hasStrikethrough?: boolean;
  hasTabularNumbers?: boolean;
  as?: ValidComponent;
}
const styles = stylex.create({
  primary: { color: colorVars["--color-text-primary"] },
  secondary: { color: colorVars["--color-text-secondary"] },
  disabled: { color: colorVars["--color-text-disabled"] },
  placeholder: { color: colorVars["--color-text-secondary"] },
  accent: { color: colorVars["--color-text-accent"] },
  inherit: { color: "inherit", fontSize: "inherit", lineHeight: "inherit" },
  body: {
    fontSize: typeScaleVars["--text-body-size"],
    lineHeight: typeScaleVars["--text-body-leading"],
    fontWeight: typeScaleVars["--text-body-weight"],
  },
  large: {
    fontSize: typeScaleVars["--text-large-size"],
    lineHeight: typeScaleVars["--text-large-leading"],
    fontWeight: typeScaleVars["--text-large-weight"],
  },
  label: {
    fontSize: typeScaleVars["--text-label-size"],
    lineHeight: typeScaleVars["--text-label-leading"],
    fontWeight: typeScaleVars["--text-label-weight"],
  },
  supporting: {
    fontSize: typeScaleVars["--text-supporting-size"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    fontWeight: typeScaleVars["--text-supporting-weight"],
  },
  code: {
    fontSize: typeScaleVars["--text-code-size"],
    lineHeight: typeScaleVars["--text-code-leading"],
    fontFamily: typographyVars["--font-family-code"],
    fontWeight: typeScaleVars["--text-code-weight"],
  },
  "display-1": {
    fontSize: typeScaleVars["--text-display-1-size"],
    lineHeight: typeScaleVars["--text-display-1-leading"],
    fontWeight: typeScaleVars["--text-display-1-weight"],
  },
  "display-2": {
    fontSize: typeScaleVars["--text-display-2-size"],
    lineHeight: typeScaleVars["--text-display-2-leading"],
    fontWeight: typeScaleVars["--text-display-2-weight"],
  },
  "display-3": {
    fontSize: typeScaleVars["--text-display-3-size"],
    lineHeight: typeScaleVars["--text-display-3-leading"],
    fontWeight: typeScaleVars["--text-display-3-weight"],
  },
  normal: { fontWeight: fontWeightVars["--font-weight-normal"] },
  medium: { fontWeight: fontWeightVars["--font-weight-medium"] },
  semibold: { fontWeight: fontWeightVars["--font-weight-semibold"] },
  bold: { fontWeight: fontWeightVars["--font-weight-bold"] },
  inline: { display: "inline" },
  block: { display: "block" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
  strikethrough: { textDecoration: "line-through" },
  tabular: { fontVariantNumeric: "tabular-nums" },
  "break-word": { overflowWrap: "break-word" },
  "break-all": { wordBreak: "break-all" },
  nowrap: { textWrap: "nowrap" },
  balance: { textWrap: "balance" },
  pretty: { textWrap: "pretty" },
});
const sizeStyles = stylex.create({
  "4xs": { fontSize: textSizeVars["--font-size-4xs"] },
  "3xs": { fontSize: textSizeVars["--font-size-3xs"] },
  "2xs": { fontSize: textSizeVars["--font-size-2xs"] },
  xsm: { fontSize: textSizeVars["--font-size-xs"] },
  sm: { fontSize: textSizeVars["--font-size-sm"] },
  base: { fontSize: textSizeVars["--font-size-base"] },
  lg: { fontSize: textSizeVars["--font-size-lg"] },
  xl: { fontSize: textSizeVars["--font-size-xl"] },
  "2xl": { fontSize: textSizeVars["--font-size-2xl"] },
  "3xl": { fontSize: textSizeVars["--font-size-3xl"] },
  "4xl": { fontSize: textSizeVars["--font-size-4xl"] },
});
function typeStyle(type: TextType) {
  switch (type) {
    case "large":
      return styles.large;
    case "label":
      return styles.label;
    case "supporting":
      return styles.supporting;
    case "code":
      return styles.code;
    case "display-1":
      return styles["display-1"];
    case "display-2":
      return styles["display-2"];
    case "display-3":
      return styles["display-3"];
    case "inherit":
      return styles.inherit;
    default:
      return styles.body;
  }
}

function textWrapStyle(textWrap: TextWrap | undefined) {
  switch (textWrap) {
    case "nowrap":
      return styles.nowrap;
    case "balance":
      return styles.balance;
    case "pretty":
      return styles.pretty;
    default:
      return false;
  }
}

export function Text(props: TextProps) {
  const type = () => props.type ?? "body";
  const color = () => props.color ?? (type() === "supporting" ? "secondary" : "primary");
  const display = () =>
    props.maxLines || props.hasCapsize ? "block" : (props.display ?? "inline");
  const rest = omit(
    props,
    "type",
    "size",
    "color",
    "weight",
    "display",
    "maxLines",
    "hasTruncateTooltip",
    "wordBreak",
    "textWrap",
    "justify",
    "hasCapsize",
    "hasStrikethrough",
    "hasTabularNumbers",
    "as",
    "xstyle",
    "class",
    "style",
    "children",
  );
  const style = createMemo(() =>
    stylexProps(
      styles[color()],
      typeStyle(type()),
      props.size && sizeStyles[props.size],
      props.weight && styles[props.weight],
      styles[display()],
      props.wordBreak && styles[props.wordBreak],
      textWrapStyle(props.textWrap),
      props.justify && props.justify !== "start" && styles[props.justify],
      props.hasStrikethrough && styles.strikethrough,
      props.hasTabularNumbers && styles.tabular,
      props.xstyle,
    ),
  );
  const theme = createMemo(() =>
    themeProps("text", { type: type(), size: props.size, color: color() }),
  );
  const title = () =>
    props.maxLines && props.hasTruncateTooltip !== false && typeof props.children === "string"
      ? props.children
      : undefined;
  return (
    <Dynamic
      component={props.as ?? "span"}
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      title={title()}
      style={{
        ...style().style,
        ...(props.maxLines && { "-webkit-line-clamp": props.maxLines }),
        ...props.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
    </Dynamic>
  );
}
