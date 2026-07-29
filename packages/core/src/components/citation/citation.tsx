import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { useTranslator } from "../../i18n";
import { stylexProps } from "../../stylex";
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";

export interface CitationSource {
  title?: string;
  url?: string;
  src?: string;
  icon?: JSX.Element | string;
}

export interface CitationProps extends BaseProps<HTMLElement> {
  source: CitationSource;
  number: number;
  variant?: "label" | "number";
  target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  referrerPolicy?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["referrerpolicy"];
}

const styles = stylex.create({
  label: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacingVars["--spacing-1"],
    verticalAlign: "baseline",
    height: spacingVars["--spacing-5"],
    fontSize: typeScaleVars["--text-supporting-size"],
    fontWeight: typeScaleVars["--text-supporting-weight"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    color: colorVars["--color-text-secondary"],
    borderRadius: radiusVars["--radius-element"],
    borderWidth: borderVars["--border-width"],
    borderStyle: "solid",
    borderColor: colorVars["--color-border"],
    paddingInline: spacingVars["--spacing-2"],
    marginInlineStart: spacingVars["--spacing-0-5"],
    textDecoration: "none",
    transitionProperty: "background-color, border-color, color",
    transitionDuration: durationVars["--duration-fast-max"],
    transitionTimingFunction: easeVars["--ease-standard"],
    maxWidth: "15em",
    overflow: "hidden",
  },
  labelWithIcon: { paddingInlineStart: spacingVars["--spacing-0-5"] },
  labelInteractive: { cursor: "pointer" },
  labelHover: {
    backgroundColor: {
      ":hover": { "@media (hover: hover)": colorVars["--color-overlay-hover"] },
    },
    color: {
      default: colorVars["--color-text-secondary"],
      ":hover": { "@media (hover: hover)": colorVars["--color-text-primary"] },
    },
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
    transitionProperty: "background-color",
    transitionDuration: durationVars["--duration-fast-max"],
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  numberInteractive: { cursor: "pointer" },
  numberHover: {
    backgroundColor: {
      default: colorVars["--color-accent-muted"],
      ":hover": { "@media (hover: hover)": colorVars["--color-overlay-hover"] },
    },
  },
  iconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: spacingVars["--spacing-4"],
    height: spacingVars["--spacing-4"],
    borderRadius: radiusVars["--radius-full"],
    backgroundColor: colorVars["--color-background-surface"],
    borderWidth: borderVars["--border-width"],
    borderStyle: "solid",
    borderColor: colorVars["--color-border"],
    overflow: "hidden",
    flexShrink: 0,
  },
  icon: { width: spacingVars["--spacing-3"], height: spacingVars["--spacing-3"] },
  labelText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 },
});

export function Citation(props: CitationProps) {
  const merged = merge({ variant: "label" } satisfies Partial<CitationProps>, props);

  const rest = omit(
    merged,
    "source",
    "number",
    "variant",
    "target",
    "rel",
    "referrerPolicy",
    "xstyle",
    "class",
    "style",
    "ref",
  );

  const t = useTranslator();

  const title = () => merged.source.title ?? String(merged.number);
  const component = (): ValidComponent => (merged.source.url ? "a" : "span");
  const target = () => (merged.source.url ? (merged.target ?? "_blank") : undefined);
  const rel = createMemo(() => {
    const tokens = new Set((merged.rel ?? "").split(/\s+/).filter(Boolean));

    if (target() === "_blank") {
      tokens.add("noopener");
      tokens.add("noreferrer");
    }

    return tokens.size > 0 ? [...tokens].join(" ") : undefined;
  });
  const imageSrc = () =>
    merged.source.src ?? (typeof merged.source.icon === "string" ? merged.source.icon : undefined);
  const iconNode = () => (typeof merged.source.icon === "string" ? undefined : merged.source.icon);
  const hasIcon = () => iconNode() != null || imageSrc() != null;

  const theme = createMemo(() => themeProps("citation", { variant: merged.variant }));
  const style = createMemo(() =>
    stylexProps(
      merged.variant === "number" ? styles.number : styles.label,
      merged.variant === "label" && hasIcon() && styles.labelWithIcon,
      merged.source.url != null &&
        (merged.variant === "number" ? styles.numberHover : styles.labelHover),
      merged.source.url != null &&
        (merged.variant === "number" ? styles.numberInteractive : styles.labelInteractive),
      merged.xstyle,
    ),
  );

  return (
    <Dynamic
      component={component()}
      {...rest}
      {...theme()}
      ref={(element: HTMLElement) => setElementRef(merged.ref, element)}
      role={merged.source.url ? "doc-noteref" : undefined}
      href={merged.source.url}
      target={target()}
      rel={merged.source.url ? rel() : undefined}
      referrerPolicy={merged.source.url ? merged.referrerPolicy : undefined}
      title={title()}
      aria-label={t("@astryx.citation.label", { number: merged.number, title: title() })}
      class={[theme().class, style().class, merged.class]}
      style={{ ...style().style, ...merged.style }}
      data-style-src={style()["data-style-src"]}
      textContent={merged.variant === "number" ? String(merged.number) : undefined}
    >
      <Show when={merged.variant === "label"}>
        <Show when={hasIcon()}>
          <span aria-hidden="true" {...stylexProps(styles.iconWrap)}>
            <Show
              when={iconNode() != null}
              fallback={<img src={imageSrc()} alt="" {...stylexProps(styles.icon)} />}
            >
              {iconNode()}
            </Show>
          </span>
        </Show>
        <span textContent={title()} {...stylexProps(styles.labelText)} />
      </Show>
    </Dynamic>
  );
}
