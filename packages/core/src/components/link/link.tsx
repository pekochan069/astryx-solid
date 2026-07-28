import type { JSX } from "@solidjs/web";

import { Dynamic } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { Match, Show, Switch, createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { LinkComponent } from "./link-provider.tsx";

import { useTranslator } from "../../i18n/use-translator.ts";
import { stylexProps } from "../../stylex/index.ts";
import { colorVars, durationVars, easeVars, spacingVars } from "../../theme/tokens.stylex.ts";
import { setElementRef } from "../../utils/set-element-ref.ts";
import { themeProps } from "../../utils/theme-props.ts";
import { computeTargetAndRel } from "./compute-target-and-rel.ts";
import { useLinkComponent } from "./use-link-component.ts";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    "align-items": "center",
    gap: spacingVars["--spacing-0-5"],
    color: colorVars["--color-text-accent"],
    "text-decoration": { default: "none", ":hover": { "@media (hover: hover)": "underline" } },
    cursor: "pointer",
    "transition-duration": durationVars["--duration-fast"],
    "transition-timing-function": easeVars["--ease-standard"],
  },
  button: { "background-color": "transparent", "border-style": "none", padding: 0 },
  disabled: { cursor: "not-allowed", opacity: 0.5, "pointer-events": "none" },
  underline: { "text-decoration": "underline" },
});

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
  tooltip?: string;
  children: JSX.Element;
}

/** Styled link. Missing href becomes button; disabled href becomes inert anchor. */
export function Link(props: LinkProps) {
  const rest = omit(
    props,
    "as",
    "label",
    "href",
    "hasUnderline",
    "isDisabled",
    "isExternalLink",
    "newTabLabel",
    "target",
    "rel",
    "tooltip",
    "children",
    "xstyle",
    "class",
    "style",
    "ref",
  );

  const adapter = useLinkComponent(() => props.as);
  const translate = useTranslator();

  const external = createMemo(() => props.isExternalLink ?? false);
  const disabled = createMemo(() => props.isDisabled ?? false);
  const targetAndRel = createMemo(() =>
    computeTargetAndRel(external() ? "_blank" : props.target, props.rel),
  );

  const style = createMemo(() =>
    stylexProps(
      styles.base,
      props.hasUnderline && styles.underline,
      disabled() && styles.disabled,
      props.href == null && styles.button,
      props.xstyle,
    ),
  );
  const shared = () => ({
    ...rest,
    ...themeProps("link"),
    class: [themeProps("link").class, style().class, props.class],
    style: { ...style().style, ...props.style },
    "data-style-src": style()["data-style-src"],
    title: props.tooltip,
    "aria-label": props.label,
  });

  return (
    <Switch
      fallback={
        <Dynamic
          component={adapter()}
          {...shared()}
          ref={(element) => setElementRef(props.ref, element)}
          href={props.href}
          target={targetAndRel().target}
          rel={targetAndRel().rel}
        >
          {props.children}
          <Show when={external() && props.href != null && !disabled()}>
            <span aria-hidden="true">↗</span>
            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                "clip-path": "inset(50%)",
              }}
              textContent={props.newTabLabel ?? translate("@astryx.link.newTab")}
            />
          </Show>
        </Dynamic>
      }
    >
      <Match when={props.href == null}>
        <button
          {...shared()}
          ref={(element) => setElementRef(props.ref, element)}
          type="button"
          disabled={disabled()}
          aria-disabled={disabled() ? "true" : undefined}
        >
          {props.children}
          <Show when={external() && props.href != null && !disabled()}>
            <span aria-hidden="true">↗</span>
            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                "clip-path": "inset(50%)",
              }}
              textContent={props.newTabLabel ?? translate("@astryx.link.newTab")}
            />
          </Show>
        </button>
      </Match>
      <Match when={disabled()}>
        <a
          {...shared()}
          ref={(element) => setElementRef(props.ref, element)}
          aria-disabled="true"
          tabindex="-1"
          onClick={(event) => event.preventDefault()}
        >
          {props.children}
          <Show when={external() && props.href != null && !disabled()}>
            <span aria-hidden="true">↗</span>
            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                "clip-path": "inset(50%)",
              }}
              textContent={props.newTabLabel ?? translate("@astryx.link.newTab")}
            />
          </Show>
        </a>
      </Match>
    </Switch>
  );
}
