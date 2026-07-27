import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { borderVars, colorVars, spacingVars, typeScaleVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export interface DividerVariantMap {
  subtle: true;
  strong: true;
}

export type DividerVariant = keyof DividerVariantMap;

export interface DividerProps extends BaseProps<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: JSX.Element;
  variant?: DividerVariant;
  isFullBleed?: boolean;
}

const styles = stylex.create({
  horizontal: { display: "flex", alignItems: "center", width: "100%" },
  vertical: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  horizontalLine: { height: borderVars["--border-width"], flexGrow: 1 },
  verticalLine: { width: borderVars["--border-width"], flexGrow: 1 },
  subtle: { backgroundColor: colorVars["--color-border"] },
  strong: { backgroundColor: colorVars["--color-border-emphasized"] },
  label: {
    flexShrink: 0,
    paddingInline: spacingVars["--spacing-3"],
    fontSize: typeScaleVars["--text-supporting-size"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    color: colorVars["--color-text-secondary"],
  },
  verticalLabel: { paddingInline: 0, paddingBlock: spacingVars["--spacing-3"] },
  fullBleedHorizontal: {
    marginInline: "calc(-1 * var(--container-padding-inline-start, 0px))",
    width:
      "calc(100% + var(--container-padding-inline-start, 0px) + var(--container-padding-inline-end, 0px))",
  },
  fullBleedVertical: {
    marginBlock: "calc(-1 * var(--container-padding-block-start, 0px))",
    height:
      "calc(100% + var(--container-padding-block-start, 0px) + var(--container-padding-block-end, 0px))",
  },
});

export function Divider(props: DividerProps) {
  const rest = omit(
    props,
    "orientation",
    "label",
    "variant",
    "isFullBleed",
    "xstyle",
    "class",
    "style",
  );

  const orientation = () => props.orientation ?? "horizontal";
  const variant = () => props.variant ?? "subtle";
  const horizontal = () => orientation() === "horizontal";
  const line = createMemo(() =>
    stylexProps(horizontal() ? styles.horizontalLine : styles.verticalLine, styles[variant()]),
  );

  const theme = createMemo(() =>
    themeProps("divider", { orientation: orientation(), variant: variant() }),
  );
  const style = createMemo(() =>
    stylexProps(
      horizontal() ? styles.horizontal : styles.vertical,
      props.isFullBleed && (horizontal() ? styles.fullBleedHorizontal : styles.fullBleedVertical),
      props.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      role="separator"
      aria-orientation={orientation()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div {...line()} />
      <Show when={props.label != null}>
        <div {...stylexProps(styles.label, !horizontal() && styles.verticalLabel)}>
          {props.label}
        </div>
        <div {...line()} />
      </Show>
    </div>
  );
}
