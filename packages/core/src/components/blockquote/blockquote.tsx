import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, spacingVars, typeScaleVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export interface BlockquoteProps extends BaseProps<HTMLQuoteElement> {
  children?: JSX.Element;
  cite?: string;
  attribution?: JSX.Element;
}

const styles = stylex.create({
  root: {
    borderInlineStartWidth: spacingVars["--spacing-0-5"],
    borderInlineStartStyle: "solid",
    borderInlineStartColor: colorVars["--color-border-emphasized"],
    paddingInlineStart: spacingVars["--spacing-4"],
    color: colorVars["--color-text-secondary"],
    margin: 0,
  },
  cite: {
    display: "block",
    marginBlockStart: spacingVars["--spacing-2"],
    fontSize: typeScaleVars["--text-supporting-size"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    fontStyle: "normal",
  },
});

export function Blockquote(props: BlockquoteProps) {
  const rest = omit(props, "attribution", "xstyle", "class", "style", "children");

  const theme = createMemo(() => themeProps("blockquote"));
  const style = createMemo(() => stylexProps(styles.root, props.xstyle));

  return (
    <blockquote
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
      <Show when={props.attribution != null}>
        <footer>
          <cite {...stylexProps(styles.cite)}>{props.attribution}</cite>
        </footer>
      </Show>
    </blockquote>
  );
}
