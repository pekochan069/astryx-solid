import { Dynamic, type JSX } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { Show, createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { TextColor, TextDisplay, TextSize, TextType, TextWeight } from "../text/text.tsx";
import type { LinkComponent } from "./link-provider.tsx";

import { useTranslator } from "../../i18n/use-translator.ts";
import { stylexProps } from "../../stylex/index.ts";
import {
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex.ts";
import { setElementRef } from "../../utils/set-element-ref.ts";
import { themeProps } from "../../utils/theme-props.ts";
import { Icon } from "../icon/icon.tsx";
import { Text } from "../text/text.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";
import { computeTargetAndRel } from "./compute-target-and-rel.ts";
import { useLinkComponent } from "./use-link-component.ts";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    "align-items": "center",
    gap: spacingVars["--spacing-0-5"],
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    "text-decoration": { default: "none", ":hover": { "@media (hover: hover)": "underline" } },
    cursor: "pointer",
    "transition-property": "color, text-decoration",
    "transition-duration": durationVars["--duration-fast"],
    "transition-timing-function": easeVars["--ease-standard"],
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-accent"]}` },
    "outline-offset": { default: "0", ":focus-visible": "2px" },
  },
  buttonReset: {
    "background-color": "transparent",
    "border-style": "none",
    padding: 0,
    "pointer-events": "auto",
    position: "relative",
  },
  hasUnderline: { "text-decoration": "underline" },
  disabled: { cursor: "not-allowed", opacity: 0.5, "pointer-events": "none" },
  standalone: {
    fontSize: typeScaleVars["--text-body-size"],
    lineHeight: typeScaleVars["--text-body-leading"],
  },
});

const linkColorStyles = stylex.create({
  primary: {
    color: {
      default: colorVars["--color-text-primary"],
      ":hover": {
        "@media (hover: hover)": `color-mix(in srgb, ${colorVars["--color-text-primary"]}, ${colorVars["--color-tint-hover"]} 15%)`,
      },
    },
  },
  secondary: {
    color: {
      default: colorVars["--color-text-secondary"],
      ":hover": {
        "@media (hover: hover)": `color-mix(in srgb, ${colorVars["--color-text-secondary"]}, ${colorVars["--color-tint-hover"]} 15%)`,
      },
    },
  },
  disabled: { color: colorVars["--color-text-disabled"] },
  placeholder: { color: colorVars["--color-text-secondary"] },
  accent: {
    color: {
      default: colorVars["--color-text-accent"],
      ":hover": {
        "@media (hover: hover)": `color-mix(in srgb, ${colorVars["--color-text-accent"]}, ${colorVars["--color-tint-hover"]} 15%)`,
      },
    },
  },
  inherit: { color: "inherit" },
});

type LinkContentsProps = {
  href?: string;
  type?: TextType;
  size?: TextSize;
  weight?: TextWeight;
  color: TextColor;
  display?: TextDisplay;
  maxLines?: number;
  external: boolean;
  disabled: boolean;
  renderAsButton: boolean;
  newTabLabel?: string;
  children?: JSX.Element;
};

function LinkContents(props: LinkContentsProps) {
  const translate = useTranslator();

  return (
    <>
      <Text
        type={props.type}
        size={props.size}
        weight={props.weight}
        color={props.color}
        display={props.display}
        maxLines={props.maxLines}
      >
        {props.children}
      </Text>
      <Show when={props.external && props.href != null && !props.disabled && !props.renderAsButton}>
        <Icon icon="externalLink" size="xsm" color="inherit" />
        <VisuallyHidden textContent={props.newTabLabel ?? translate("@astryx.link.newTab")} />
      </Show>
    </>
  );
}

export interface LinkProps extends BaseProps<HTMLAnchorElement | HTMLButtonElement> {
  ref?: (element: HTMLAnchorElement | HTMLButtonElement) => void;
  as?: LinkComponent;
  label?: string;
  href?: string;
  hasUnderline?: boolean;
  isDisabled?: boolean;
  isExternalLink?: boolean;
  newTabLabel?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
  referrerPolicy?: JSX.HTMLReferrerPolicy;
  tooltip?: string;
  isStandalone?: boolean;
  type?: TextType;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  display?: TextDisplay;
  maxLines?: number;
  children: JSX.Element;
}

/** Styled link. Missing href becomes button; disabled href becomes inert anchor. */
export function Link(props: LinkProps) {
  const merged = merge(
    {
      color: "accent",
      isExternalLink: false,
      isDisabled: false,
    } satisfies Partial<LinkProps>,
    props,
  );
  const rest = omit(
    merged,
    "as",
    "label",
    "href",
    "hasUnderline",
    "isDisabled",
    "isExternalLink",
    "newTabLabel",
    "target",
    "rel",
    "download",
    "referrerPolicy",
    "tooltip",
    "isStandalone",
    "type",
    "size",
    "weight",
    "color",
    "display",
    "maxLines",
    "children",
    "xstyle",
    "class",
    "style",
    "ref",
    "children",
  );

  const adapter = useLinkComponent(() => merged.as);
  const targetAndRel = createMemo(() =>
    computeTargetAndRel(merged.isExternalLink ? "_blank" : merged.target, merged.rel),
  );
  const role = createMemo(() => {
    if (merged.href != null && !merged.isDisabled) return "link";
    if (merged.href == null && merged.onClick != null) return "button";
    return "inert";
  });
  const renderAsButton = createMemo(
    () => role() === "button" || (role() === "inert" && merged.href == null),
  );

  const style = createMemo(() =>
    stylexProps(
      styles.base,
      linkColorStyles[merged.color],
      merged.hasUnderline && styles.hasUnderline,
      merged.isStandalone && styles.standalone,
      renderAsButton() && styles.buttonReset,
      merged.isDisabled && styles.disabled,
      merged.xstyle,
    ),
  );
  const theme = createMemo(() => themeProps("link", { color: merged.color }));
  const shared = () => ({
    ...rest,
    ...theme(),
    class: [theme().class, style().class, merged.class],
    style: { ...style().style, ...merged.style },
    "data-style-src": style()["data-style-src"],
    "aria-label": merged.label || undefined,
    title: merged.tooltip,
  });

  return (
    <Show
      when={renderAsButton()}
      fallback={
        <Show
          when={!merged.isDisabled}
          fallback={
            <a
              {...shared()}
              ref={(element) => setElementRef(merged.ref, element)}
              aria-disabled="true"
              tabindex="-1"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <LinkContents
                href={merged.href}
                type={merged.type}
                size={merged.size}
                weight={merged.weight}
                color={merged.color}
                display={merged.display}
                maxLines={merged.maxLines}
                external={merged.isExternalLink}
                disabled={merged.isDisabled}
                renderAsButton={renderAsButton()}
                newTabLabel={merged.newTabLabel}
              >
                {merged.children}
              </LinkContents>
            </a>
          }
        >
          <Dynamic
            component={adapter()}
            {...shared()}
            ref={(element) => setElementRef(merged.ref, element)}
            href={merged.href}
            target={targetAndRel().target}
            rel={targetAndRel().rel}
            download={merged.download}
            referrerpolicy={merged.referrerPolicy}
          >
            <LinkContents
              href={merged.href}
              type={merged.type}
              size={merged.size}
              weight={merged.weight}
              color={merged.color}
              display={merged.display}
              maxLines={merged.maxLines}
              external={merged.isExternalLink}
              disabled={merged.isDisabled}
              renderAsButton={renderAsButton()}
              newTabLabel={merged.newTabLabel}
            >
              {merged.children}
            </LinkContents>
          </Dynamic>
        </Show>
      }
    >
      <button
        {...shared()}
        ref={(element) => setElementRef(merged.ref, element)}
        type="button"
        onClick={merged.onClick}
        aria-disabled={merged.isDisabled ? "true" : undefined}
        disabled={merged.isDisabled}
        tabindex={merged.isDisabled ? "-1" : undefined}
      >
        <LinkContents
          href={merged.href}
          type={merged.type}
          size={merged.size}
          weight={merged.weight}
          color={merged.color}
          display={merged.display}
          maxLines={merged.maxLines}
          external={merged.isExternalLink}
          disabled={merged.isDisabled}
          renderAsButton={renderAsButton()}
          newTabLabel={merged.newTabLabel}
        >
          {merged.children}
        </LinkContents>
      </button>
    </Show>
  );
}
