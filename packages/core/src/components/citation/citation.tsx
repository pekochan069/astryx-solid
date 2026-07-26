import { Dynamic, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { useTranslator } from "../../i18n";
import { stylexProps } from "../../stylex";
import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export interface CitationSource {
  title?: string;
  url?: string;
  icon?: string;
}

export interface CitationProps extends BaseProps<HTMLElement> {
  source: CitationSource;
  number: number;
  variant?: "label" | "number";
}
const styles = stylex.create({
  label: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacingVars["--spacing-1"],
    verticalAlign: "baseline",
    height: spacingVars["--spacing-5"],
    fontSize: typeScaleVars["--text-supporting-size"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    color: colorVars["--color-text-secondary"],
    borderRadius: radiusVars["--radius-element"],
    borderWidth: borderVars["--border-width"],
    borderStyle: "solid",
    borderColor: colorVars["--color-border"],
    paddingInline: spacingVars["--spacing-2"],
    textDecoration: "none",
    maxWidth: "15em",
    overflow: "hidden",
  },
  number: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    verticalAlign: "super",
    fontSize: typeScaleVars["--text-supporting-size"],
    fontWeight: fontWeightVars["--font-weight-semibold"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    color: colorVars["--color-text-secondary"],
    backgroundColor: colorVars["--color-accent-muted"],
    borderRadius: radiusVars["--radius-full"],
    minWidth: spacingVars["--spacing-5"],
    height: spacingVars["--spacing-5"],
    paddingInline: spacingVars["--spacing-1"],
    textDecoration: "none",
  },
  labelWithIcon: { paddingInlineStart: spacingVars["--spacing-0-5"] },
  iconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: spacingVars["--spacing-4"],
    height: spacingVars["--spacing-4"],
    borderRadius: radiusVars["--radius-full"],
    overflow: "hidden",
    flexShrink: 0,
  },
  icon: { width: spacingVars["--spacing-3"], height: spacingVars["--spacing-3"] },
  labelText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 },
});
export function Citation(props: CitationProps) {
  const t = useTranslator();

  const rest = omit(props, "source", "number", "variant", "xstyle", "class", "style");

  const variant = () => props.variant ?? "label";
  const title = () => props.source.title ?? String(props.number);

  const theme = createMemo(() => themeProps("citation", { variant: variant() }));
  const component = (): ValidComponent => (props.source.url ? "a" : "span");
  const style = createMemo(() =>
    stylexProps(
      variant() === "number" ? styles.number : styles.label,
      variant() === "label" && props.source.icon != null && styles.labelWithIcon,
      props.xstyle,
    ),
  );

  return (
    <Dynamic
      component={component()}
      {...rest}
      {...theme()}
      href={props.source.url}
      target={props.source.url ? "_blank" : undefined}
      rel={props.source.url ? "noopener noreferrer" : undefined}
      role={props.source.url ? "doc-noteref" : undefined}
      title={title()}
      aria-label={t("@astryx.citation.label", { number: props.number, title: title() })}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
      textContent={variant() === "number" ? props.number : undefined}
    >
      <Show when={variant() === "label"}>
        <Show when={props.source.icon != null}>
          <span {...stylexProps(styles.iconWrap)}>
            <img src={props.source.icon} alt="" aria-hidden="true" {...stylexProps(styles.icon)} />
          </span>
        </Show>
        <span textContent={title()} {...stylexProps(styles.labelText)} />
      </Show>
    </Dynamic>
  );
}
