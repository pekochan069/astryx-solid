import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { Match, Show, Switch, createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { OnClick, OnClickEventType } from "../../types/handler.types.ts";

import { composeEventHandlers } from "../../interactions/compose-event-handlers.ts";
import { useSize } from "../../size-context/size-context.ts";
import { stylexProps } from "../../stylex/index.ts";
import {
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
} from "../../theme/tokens.stylex.ts";
import { themeProps } from "../../utils/theme-props.ts";

/**
 * Base button styles
 * Pseudo-classes are nested within properties per StyleX recommendation:
 * https://stylexjs.com/docs/learn/styling-ui/defining-styles#pseudo-classes
 */
const styles = stylex.create({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingVars["--spacing-2"],
    paddingBlock: spacingVars["--spacing-2"],
    paddingInline: spacingVars["--spacing-3"],
    borderWidth: 0,
    borderStyle: "none",

    borderRadius: `var(--_button-radius, ${radiusVars["--radius-element"]})`,
    fontFamily: "inherit",
    fontSize: typeScaleVars["--text-label-size"],
    lineHeight: typeScaleVars["--text-label-leading"],
    fontWeight: fontWeightVars["--font-weight-medium"],
    whiteSpace: "nowrap",
    cursor: "pointer",
    transitionProperty: "background-image, background-color, color, opacity, transform",
    transitionDuration: {
      default: durationVars["--duration-fast"],
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  pressable: {
    transform: {
      default: "scale(1)",
      ":active": "scale(0.98)",
    },
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
    backgroundImage: "none",
    transform: {
      default: "none",
      ":active": "none",
    },
  },
  ariaDisabled: {
    backgroundImage: {
      default: "none",
      ":hover": {
        "@media (hover: hover)": "none",
      },
      ":active": "none",
    },
  },
  iconOnly: {
    "--button-icon-only-aspect": "1 / 1",
    aspectRatio: "var(--button-icon-only-aspect)",
    paddingInline: 0,
    paddingBlock: 0,
  },
  endContentWrapper: {
    display: "inline-flex",
    alignItems: "center",
    color: "inherit",
  },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contentWrapper: {
    display: "contents",
  },
  labelText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },
  link: {
    textDecoration: "none",
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars["--size-element-sm"],
  },
  md: {
    height: sizeVars["--size-element-md"],
  },
  lg: {
    height: sizeVars["--size-element-lg"],
  },
});

/**
 * Icon size per button size.
 * Matches Icon sizing: sm/md=16px, lg=20px.
 * fontSize is set so emoji and text-based icons scale correctly.
 */
const iconSizeStyles = stylex.create({
  sm: { width: 16, height: 16, fontSize: 16 },
  md: { width: 16, height: 16, fontSize: 16 },
  lg: { width: 20, height: 20, fontSize: 20 },
});

/**
 * Variant styles using backgroundImage for layered colors
 * Pseudo-classes are nested within properties per StyleX recommendation
 * Overlay is stacked on top of base color using multiple linear-gradients
 * Focus outline color matches variant (destructive uses negative color)
 */
const variants = stylex.create({
  primary: {
    backgroundColor: colorVars["--color-accent"],
    color: colorVars["--color-on-accent"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
  },
  secondary: {
    backgroundColor: colorVars["--color-neutral"],
    color: colorVars["--color-text-primary"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: colorVars["--color-text-primary"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
  },
  destructive: {
    backgroundColor: colorVars["--color-error"],
    color: colorVars["--color-on-error"],
    backgroundImage: {
      default: null,
      ":hover": {
        "@media (hover: hover)": `linear-gradient(${colorVars["--color-overlay-hover"]}, ${colorVars["--color-overlay-hover"]})`,
      },
      ":active": `linear-gradient(${colorVars["--color-overlay-pressed"]}, ${colorVars["--color-overlay-pressed"]})`,
    },
    outline: {
      default: null,
      ":focus-visible": `2px solid ${colorVars["--color-error"]}`,
    },
    "--button-focus-offset": "3px",
    outlineOffset: {
      default: "0",
      ":focus-visible": "var(--button-focus-offset)",
    },
  },
});

/** Built-in visual variants supported by {@link Button}. */
export interface ButtonVariantMap {
  primary: true;
  secondary: true;
  ghost: true;
  destructive: true;
}

/** Visual treatment supported by {@link Button}. */
export type ButtonVariant = keyof ButtonVariantMap;

/** Button size derived from the supported StyleX size styles. */
export type ButtonSize = keyof typeof sizeStyles;

/** Props for the {@link Button} component. */
export interface ButtonProps extends BaseProps<HTMLButtonElement> {
  /**
   * Accessible button label and default visible content.
   * Also becomes `aria-label` when {@link isIconOnly} is true.
   */
  label: string;

  /** Custom visible label content. Replaces `label` visually when provided. */
  children?: JSX.Element;

  /** Leading icon or visual rendered before the label. */
  icon?: JSX.Element;

  /** Content rendered after the label, such as a shortcut or status icon. */
  endContent?: JSX.Element;

  /** Visual treatment. @default "secondary" */
  variant?: ButtonVariant;

  /** Element height and icon scale. Inherits from size context when omitted. */
  size?: ButtonSize;

  /** Native tooltip text shown through the button `title` attribute. */
  tooltip?: string;

  /** Prevents activation and applies disabled styling. @default false */
  isDisabled?: boolean;

  /** Marks the action busy and disables it unless interruptible. @default false */
  isLoading?: boolean;

  /** Pending-state alias for {@link isLoading}. @default false */
  isPending?: boolean;

  /** Keeps a loading or pending action enabled so another click can interrupt it. */
  isInterruptible?: boolean;

  /** Renders only the icon and uses `label` as its accessible name. @default false */
  isIconOnly?: boolean;

  /** Native button behavior. @default "button" */
  type?: "button" | "submit" | "reset";

  /** Called for enabled button clicks. Disabled clicks are prevented. */
  onClick?: OnClick<HTMLButtonElement>;
}

/**
 * Renders an accessible, themed action button.
 *
 * Disabled buttons with a tooltip remain focusable and expose
 * `aria-disabled="true"`, allowing keyboard users to discover the explanation.
 * Loading and pending states expose `aria-busy="true"`.
 *
 * @example
 * ```tsx
 * <Button label="Save changes" variant="primary" onClick={save} />
 * <Button label="Delete" icon={<TrashIcon />} isIconOnly />
 * ```
 */
export function Button(props: ButtonProps) {
  const merged = merge(
    {
      variant: "secondary" as ButtonVariant,
      type: "button" as const,
      isDisabled: false,
      isLoading: false,
      isPending: false,
      isIconOnly: false,
    },
    props,
  );
  const rest = omit(
    merged,
    "xstyle",
    "label",
    "children",
    "icon",
    "endContent",
    "size",
    "variant",
    "isDisabled",
    "isLoading",
    "isPending",
    "isInterruptible",
    "isIconOnly",
    "tooltip",
    "type",
    "onClick",
    "class",
    "style",
  );

  const inheritedSize = useSize();
  const size = createMemo(() => merged.size ?? inheritedSize());
  const variant = createMemo(() => merged.variant ?? "secondary");
  const type = createMemo(() => merged.type ?? "button");
  const loading = createMemo(() => merged.isLoading || merged.isPending);
  const disabled = createMemo(() => merged.isDisabled || (loading() && !merged.isInterruptible));
  const ariaDisabled = createMemo(() => merged.tooltip != null && disabled());

  const theme = createMemo(() => themeProps("button", { variant: variant(), size: size() }));
  const style = createMemo(() => {
    const s = size();
    const currentVariant = variant();
    return stylexProps(
      styles.base,
      s === "sm" && sizeStyles.sm,
      s === "md" && sizeStyles.md,
      s === "lg" && sizeStyles.lg,
      currentVariant === "primary" && variants.primary,
      currentVariant === "secondary" && variants.secondary,
      currentVariant === "ghost" && variants.ghost,
      currentVariant === "destructive" && variants.destructive,
      styles.pressable,
      merged.isIconOnly && styles.iconOnly,
      disabled() && styles.disabled,
      ariaDisabled() && styles.ariaDisabled,
      merged.xstyle,
    );
  });

  const onClick = composeEventHandlers<OnClickEventType<HTMLButtonElement>>((event) => {
    if (disabled()) event.preventDefault();
  }, props.onClick);

  return (
    <button
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...merged.style }}
      data-style-src={style()["data-style-src"]}
      type={type()}
      title={merged.tooltip}
      disabled={ariaDisabled() ? undefined : disabled()}
      aria-busy={loading() ? "true" : undefined}
      aria-disabled={ariaDisabled() ? "true" : undefined}
      aria-label={merged.isIconOnly ? merged.label : undefined}
      onClick={onClick}
    >
      <Show when={merged.icon}>
        <span
          {...stylex.attrs(
            styles.iconWrapper,
            size() === "sm" && iconSizeStyles.sm,
            size() === "md" && iconSizeStyles.md,
            size() === "lg" && iconSizeStyles.lg,
          )}
        >
          {merged.icon}
        </span>
      </Show>
      <Show when={!merged.isIconOnly}>
        <span {...stylex.attrs(styles.labelText)}>
          <Switch fallback={merged.label}>
            <Match when={merged.children != null}>{merged.children}</Match>
          </Switch>
        </span>
        <Show when={merged.endContent}>
          <span {...stylex.attrs(styles.endContentWrapper)}>{merged.endContent}</span>
        </Show>
      </Show>
    </button>
  );
}
