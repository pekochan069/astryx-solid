import type { JSX } from "@solidjs/web";

import { createMemo, createSignal, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { SizeValue } from "../../types/size-value.types.ts";
import type { LinkComponent } from "../link/link-provider.tsx";

import { useSize } from "../../size-context/size-context.ts";
import { stylexProps } from "../../stylex/index.ts";
import { themeProps } from "../../utils/theme-props.ts";
import { useButtonGroup } from "../button-group/button-group-context.ts";
import { computeTargetAndRel } from "../link/compute-target-and-rel.ts";
import { useLinkComponent } from "../link/use-link-component.ts";
import { createButtonClickHandler, createButtonTooltip } from "./button-interactions.ts";
import { ButtonRoot } from "./button-root.tsx";
import { ButtonTooltip } from "./button-tooltip.tsx";
import { elevationStyles, groupStyles, sizeStyles, styles, variants } from "./button.stylex.ts";

function callConsumerHandler(handler: unknown, event: Event) {
  if (typeof handler === "function") handler(event);
}

export interface ButtonVariantMap {
  primary: true;
  secondary: true;
  ghost: true;
  destructive: true;
}

export type ButtonVariant = keyof ButtonVariantMap;
export type ButtonSize = keyof typeof sizeStyles;
export type ButtonElevation = keyof typeof elevationStyles;

export interface ButtonProps extends BaseProps<HTMLButtonElement> {
  ref?: (element: HTMLButtonElement | HTMLAnchorElement) => void;
  label: string;
  children?: JSX.Element;
  icon?: JSX.Element;
  endContent?: JSX.Element;
  variant?: ButtonVariant;
  size?: ButtonSize;
  elevation?: ButtonElevation;
  width?: SizeValue;
  tooltip?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isInterruptible?: boolean;
  isIconOnly?: boolean;
  type?: "button" | "submit" | "reset";
  name?: string;
  value?: string | number | readonly string[];
  form?: string;
  formAction?: string;
  formEncType?: JSX.HTMLFormEncType;
  formMethod?: JSX.HTMLFormMethod;
  formNoValidate?: boolean;
  formTarget?: string;
  href?: string;
  as?: LinkComponent;
  target?: string;
  rel?: string;
  clickAction?: (event: MouseEvent) => void | Promise<void>;
  onClick?: (event: MouseEvent) => void;
}

export function Button(props: ButtonProps) {
  const merged = merge(
    {
      variant: "secondary" as ButtonVariant,
      type: "button" as const,
      elevation: "none" as ButtonElevation,
      isDisabled: false,
      isLoading: false,
      isIconOnly: false,
      isInterruptible: false,
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
    "elevation",
    "width",
    "isDisabled",
    "isLoading",
    "isInterruptible",
    "isIconOnly",
    "tooltip",
    "type",
    "name",
    "value",
    "form",
    "formAction",
    "formEncType",
    "formMethod",
    "formNoValidate",
    "formTarget",
    "href",
    "as",
    "target",
    "rel",
    "clickAction",
    "onClick",
    "onKeyDown",
    "onPointerEnter",
    "onPointerLeave",
    "onFocus",
    "onBlur",
    "aria-label",
    "aria-describedby",
    "class",
    "style",
    "ref",
  );

  const group = useButtonGroup();
  const inheritedSize = useSize();
  const adapter = useLinkComponent(() => merged.as);

  const [activeActions, setActiveActions] = createSignal(0);
  const size = createMemo(() => merged.size ?? inheritedSize());
  const variant = createMemo(() => merged.variant ?? "secondary");
  const loading = createMemo(() => merged.isLoading || activeActions() > 0);
  const delaySpinner = createMemo(() => activeActions() > 0 || merged.isInterruptible);
  const disabled = createMemo(
    () => merged.isDisabled || group?.isDisabled || (loading() && !merged.isInterruptible),
  );
  const ariaDisabled = createMemo(() => merged.tooltip != null && disabled());
  const renderAsLink = createMemo(() => merged.href != null && !disabled());
  const targetAndRel = createMemo(() => computeTargetAndRel(merged.target, merged.rel));
  const tooltip = createButtonTooltip(merged);
  const needsAriaLabel = createMemo(
    () =>
      (merged.isIconOnly && merged.label !== "") ||
      (loading() && !merged.isIconOnly) ||
      (merged.children != null && merged.children !== merged.label),
  );
  const ariaLabel = createMemo(() => (needsAriaLabel() ? merged.label : merged["aria-label"]));

  const theme = createMemo(() => themeProps("button", { variant: variant(), size: size() }));
  const styled = createMemo(() => {
    const currentVariant = variant();
    const solidGroup = currentVariant === "primary" || currentVariant === "destructive";

    return stylexProps(
      styles.base,
      size() === "sm" && sizeStyles.sm,
      size() === "md" && sizeStyles.md,
      size() === "lg" && sizeStyles.lg,
      currentVariant === "primary" && variants.primary,
      currentVariant === "secondary" && variants.secondary,
      currentVariant === "ghost" && variants.ghost,
      currentVariant === "destructive" && variants.destructive,
      merged.isIconOnly && styles.iconOnly,
      disabled() && styles.disabled,
      ariaDisabled() && styles.ariaDisabled,
      renderAsLink() && styles.link,
      group == null && styles.pressable,
      group?.orientation === "horizontal" && groupStyles.horizontal,
      group?.orientation === "vertical" && groupStyles.vertical,
      solidGroup && group?.orientation === "horizontal" && groupStyles.onSolidHorizontal,
      solidGroup && group?.orientation === "vertical" && groupStyles.onSolidVertical,
      group == null && elevationStyles[merged.elevation],
      merged.xstyle,
    );
  });

  const onClick = createButtonClickHandler(merged, disabled, setActiveActions);
  const onKeyDown = (event: KeyboardEvent) => {
    if (ariaDisabled() && (event.key === "Enter" || event.key === " ")) event.preventDefault();
    else callConsumerHandler(merged.onKeyDown, event);
    if (event.key === "Escape") tooltip.hide();
  };

  return (
    <>
      <ButtonRoot
        button={merged}
        rest={rest}
        adapter={adapter()}
        renderAsLink={renderAsLink()}
        disabled={disabled()}
        ariaDisabled={ariaDisabled()}
        loading={loading()}
        delaySpinner={delaySpinner()}
        size={size()}
        variant={variant()}
        target={targetAndRel().target}
        rel={targetAndRel().rel}
        theme={theme()}
        stylexClass={styled().class}
        stylexStyle={styled().style}
        width={merged.width}
        dataStyleSrc={styled()["data-style-src"]}
        ariaLabel={ariaLabel()}
        tooltip={tooltip}
        onClick={onClick}
        onKeyDown={onKeyDown}
      />
      {merged.tooltip != null && <ButtonTooltip text={merged.tooltip} tooltip={tooltip} />}
    </>
  );
}
