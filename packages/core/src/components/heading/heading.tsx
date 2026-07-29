import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { TextColor, TextDisplay, TextJustify, TextWrap, WordBreak } from "../text/text";

import { stylexProps } from "../../stylex";
import { colorVars, typeScaleVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { truncationStyles } from "../text/truncation.stylex";
import { useTruncation } from "../text/use-truncation";

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
  hasTruncateTooltip?: boolean | "above" | "below" | "start" | "end";
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
  capsize: {
    textBoxEdge: "cap alphabetic",
    textBoxTrim: "trim-both",
    display: "block",
  },
  "break-word": { wordBreak: "normal", overflowWrap: "break-word" },
  "break-all": { wordBreak: "break-all" },
  nowrap: { textWrap: "nowrap" },
  balance: { textWrap: "balance" },
  pretty: { textWrap: "pretty" },
  wrap: { textWrap: "wrap" },
});

function headingWrapStyle(textWrap: TextWrap | undefined) {
  switch (textWrap) {
    case "wrap":
      return styles.wrap;
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
  const merged = merge({ color: "primary" } satisfies Partial<HeadingProps>, props);

  const rest = omit(
    merged,
    "level",
    "type",
    "accessibilityLevel",
    "color",
    "display",
    "maxLines",
    "hasTruncateTooltip",
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

  const truncation = useTruncation({
    maxLines: () => merged.maxLines,
    wordBreak: () => merged.wordBreak,
    ref: merged.ref,
  });

  const title = () =>
    maxLines() > 0 && merged.hasTruncateTooltip !== false && truncation.isTruncated()
      ? truncation.fullText()
      : undefined;
  const { maxLines, wordBreak } = truncation;
  const display = () => (maxLines() || merged.hasCapsize ? "block" : (merged.display ?? "block"));

  const theme = createMemo(() =>
    themeProps("heading", { level: merged.level, type: merged.type, color: merged.color }),
  );
  const style = createMemo(() =>
    stylexProps(
      styles[merged.color],
      merged.type ? styles[merged.type] : styles[merged.level],
      maxLines() === 1 ? truncationStyles.singleLine : maxLines() > 1 && truncationStyles.multiLine,
      maxLines() > 0 && styles[wordBreak()],
      maxLines() === 0 && styles[display()],
      merged.hasCapsize && styles.capsize,
      headingWrapStyle(merged.textWrap),
      merged.justify && merged.justify !== "start" && styles[merged.justify],
      merged.hasStrikethrough && styles.strikethrough,
      merged.xstyle,
    ),
  );

  return (
    <Dynamic
      component={tags[merged.level]}
      {...rest}
      {...theme()}
      aria-level={
        merged.accessibilityLevel !== merged.level ? merged.accessibilityLevel : undefined
      }
      class={[theme().class, style().class, merged.class]}
      ref={truncation.ref}
      title={title()}
      style={{
        ...style().style,
        ...(maxLines() > 1 && { "-webkit-line-clamp": maxLines() }),
        ...merged.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {merged.children}
    </Dynamic>
  );
}
