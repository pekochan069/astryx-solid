import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit, Show } from "solid-js";

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
  horizontalLine: {
    height: borderVars["--border-width"],
    flexGrow: 1,
    flexShrink: 1,
  },
  verticalLine: {
    width: borderVars["--border-width"],
    flexGrow: 1,
    flexShrink: 1,
  },
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
    marginInlineStart: "calc(-1 * var(--container-padding-inline-start, 0px))",
    marginInlineEnd: "calc(-1 * var(--container-padding-inline-end, 0px))",
    width:
      "calc(100% + var(--container-padding-inline-start, 0px) + var(--container-padding-inline-end, 0px))",
  },
  fullBleedVertical: {
    marginBlockStart: "calc(-1 * var(--container-padding-block-start, 0px))",
    marginBlockEnd: "calc(-1 * var(--container-padding-block-end, 0px))",
    height:
      "calc(100% + var(--container-padding-block-start, 0px) + var(--container-padding-block-end, 0px))",
  },
});

export function Divider(props: DividerProps) {
  const merged = merge(
    {
      orientation: "horizontal",
      variant: "subtle",
    } satisfies Partial<DividerProps>,
    props,
  );

  const rest = omit(
    merged,
    "orientation",
    "label",
    "variant",
    "isFullBleed",
    "xstyle",
    "class",
    "style",
  );

  const line = createMemo(() =>
    stylexProps(
      merged.orientation === "horizontal" ? styles.horizontalLine : styles.verticalLine,
      styles[merged.variant],
    ),
  );

  const theme = createMemo(() =>
    themeProps("divider", { orientation: merged.orientation, variant: merged.variant }),
  );
  const style = createMemo(() =>
    stylexProps(
      merged.orientation === "horizontal" ? styles.horizontal : styles.vertical,
      merged.isFullBleed &&
        (merged.orientation === "horizontal"
          ? styles.fullBleedHorizontal
          : styles.fullBleedVertical),
      merged.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      role="separator"
      aria-orientation={merged.orientation}
      class={[theme().class, style().class, merged.class]}
      style={{ ...style().style, ...merged.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div {...line()} />
      <Show when={merged.label != null}>
        <div
          {...stylexProps(
            styles.label,
            merged.orientation !== "horizontal" && styles.verticalLabel,
          )}
        >
          {merged.label}
        </div>
        <div {...line()} />
      </Show>
    </div>
  );
}
