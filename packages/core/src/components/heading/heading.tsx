import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { TextColor, TextDisplay, TextJustify, TextWrap, WordBreak } from "../text/text";

import { stylexProps } from "../../stylex";
import { colorVars, typeScaleVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingType = "display-1" | "display-2" | "display-3";
export interface HeadingProps extends BaseProps<HTMLHeadingElement> {
  children?: JSX.Element;
  level: HeadingLevel;
  type?: HeadingType;
  accessibilityLevel?: HeadingLevel;
  color?: TextColor;
  display?: TextDisplay;
  maxLines?: number;
  wordBreak?: WordBreak;
  textWrap?: TextWrap;
  justify?: TextJustify;
  hasCapsize?: boolean;
  hasStrikethrough?: boolean;
}
const tags: Record<HeadingLevel, ValidComponent> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};
const styles = stylex.create({
  primary: { color: colorVars["--color-text-primary"] },
  secondary: { color: colorVars["--color-text-secondary"] },
  disabled: { color: colorVars["--color-text-disabled"] },
  placeholder: { color: colorVars["--color-text-secondary"] },
  accent: { color: colorVars["--color-text-accent"] },
  inherit: { color: "inherit" },
  1: {
    fontSize: typeScaleVars["--text-heading-1-size"],
    lineHeight: typeScaleVars["--text-heading-1-leading"],
    fontWeight: typeScaleVars["--text-heading-1-weight"],
  },
  2: {
    fontSize: typeScaleVars["--text-heading-2-size"],
    lineHeight: typeScaleVars["--text-heading-2-leading"],
    fontWeight: typeScaleVars["--text-heading-2-weight"],
  },
  3: {
    fontSize: typeScaleVars["--text-heading-3-size"],
    lineHeight: typeScaleVars["--text-heading-3-leading"],
    fontWeight: typeScaleVars["--text-heading-3-weight"],
  },
  4: {
    fontSize: typeScaleVars["--text-heading-4-size"],
    lineHeight: typeScaleVars["--text-heading-4-leading"],
    fontWeight: typeScaleVars["--text-heading-4-weight"],
  },
  5: {
    fontSize: typeScaleVars["--text-heading-5-size"],
    lineHeight: typeScaleVars["--text-heading-5-leading"],
    fontWeight: typeScaleVars["--text-heading-5-weight"],
  },
  6: {
    fontSize: typeScaleVars["--text-heading-6-size"],
    lineHeight: typeScaleVars["--text-heading-6-leading"],
    fontWeight: typeScaleVars["--text-heading-6-weight"],
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
  inline: { display: "inline" },
  block: { display: "block" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
  strikethrough: { textDecoration: "line-through" },
  "break-word": { overflowWrap: "break-word" },
  "break-all": { wordBreak: "break-all" },
  nowrap: { textWrap: "nowrap" },
  balance: { textWrap: "balance" },
  pretty: { textWrap: "pretty" },
});
function headingWrapStyle(textWrap: TextWrap | undefined) {
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

export function Heading(props: HeadingProps) {
  const color = () => props.color ?? "primary";
  const display = () => (props.maxLines || props.hasCapsize ? "block" : (props.display ?? "block"));
  const rest = omit(
    props,
    "level",
    "type",
    "accessibilityLevel",
    "color",
    "display",
    "maxLines",
    "wordBreak",
    "textWrap",
    "justify",
    "hasCapsize",
    "hasStrikethrough",
    "xstyle",
    "class",
    "style",
    "children",
  );
  const style = createMemo(() =>
    stylexProps(
      styles[color()],
      props.type ? styles[props.type] : styles[props.level],
      styles[display()],
      props.wordBreak && styles[props.wordBreak],
      headingWrapStyle(props.textWrap),
      props.justify && props.justify !== "start" && styles[props.justify],
      props.hasStrikethrough && styles.strikethrough,
      props.xstyle,
    ),
  );
  const theme = createMemo(() =>
    themeProps("heading", { level: props.level, type: props.type, color: color() }),
  );
  return (
    <Dynamic
      component={tags[props.level]}
      {...rest}
      {...theme()}
      aria-level={props.accessibilityLevel !== props.level ? props.accessibilityLevel : undefined}
      class={[theme().class, style().class, props.class]}
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
