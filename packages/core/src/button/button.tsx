import type { BaseProps } from "../base-props.ts";
import * as stylex from "@stylexjs/stylex";
import {
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
} from "../tokens.stylex.ts";
import type { OnClick, OnClickEventType } from "../types/handler.types.ts";
import type { JSX } from "@solidjs/web";
import { Match, Show, Switch, merge, omit } from "solid-js";
import { useSize } from "../size-context/size-context.ts";

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

/**
 * Extensible variant map for Button.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Button' {
 *   interface ButtonVariantMap {
 *     'primary-muted': true;
 *   }
 * }
 * ```
 */
export interface ButtonVariantMap {
  primary: true;
  secondary: true;
  ghost: true;
  destructive: true;
}

/**
 * Button variant type derived from ButtonVariantMap.
 * Extensible via module augmentation of ButtonVariantMap.
 */
export type ButtonVariant = keyof ButtonVariantMap;

/**
 * Button size type derived from the sizeStyles StyleX object
 */
export type ButtonSize = keyof typeof sizeStyles;

// export interface ButtonProps extends BaseProps<HTMLButtonElement> {
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   isDisabled?: boolean;
// }
export interface ButtonProps extends BaseProps<HTMLButtonElement> {
  label: string;
  children?: JSX.Element;
  icon?: JSX.Element;
  endContent?: JSX.Element;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tooltip?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  isInterruptible?: boolean;
  isIconOnly?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: OnClick<HTMLButtonElement>;
}

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
  const size = useSize(merged.size);
  const loading = merged.isLoading || merged.isPending;
  const disabled = merged.isDisabled || (loading && !merged.isInterruptible);
  const ariaDisabled = merged.tooltip != null && disabled;
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
  );

  const onClick = (event: OnClickEventType<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    props.onClick?.(event);
  };

  const style = stylex.props(
    styles.base,
    size === "sm" && sizeStyles.sm,
    size === "md" && sizeStyles.md,
    size === "lg" && sizeStyles.lg,
    merged.variant === "primary" && variants.primary,
    merged.variant === "secondary" && variants.secondary,
    merged.variant === "ghost" && variants.ghost,
    merged.variant === "destructive" && variants.destructive,
    styles.pressable,
    merged.isIconOnly && styles.iconOnly,
    disabled && styles.disabled,
    ariaDisabled && styles.ariaDisabled,
  );

  return (
    <button
      {...rest}
      class={[style.className, props.class]}
      style={style.style}
      data-style-src={style["data-style-src"]}
      type={merged.type}
      title={merged.tooltip}
      disabled={ariaDisabled ? undefined : disabled}
      aria-busy={loading ? "true" : undefined}
      aria-disabled={ariaDisabled ? "true" : undefined}
      aria-label={merged.isIconOnly ? merged.label : undefined}
      onClick={onClick}
    >
      <Show when={merged.icon}>
        <span
          {...stylex.attrs(
            styles.iconWrapper,
            size === "sm" && iconSizeStyles.sm,
            size === "md" && iconSizeStyles.md,
            size === "lg" && iconSizeStyles.lg,
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
