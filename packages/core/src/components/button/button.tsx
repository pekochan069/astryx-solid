import type { JSX } from "@solidjs/web";

import { Dynamic } from "@solidjs/web";
import { createMemo, createSignal, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { LinkComponent } from "../link/link-provider.tsx";

import { useSize } from "../../size-context/size-context.ts";
import { stylexProps } from "../../stylex/index.ts";
import { themeProps } from "../../utils/theme-props.ts";
import { useButtonGroup } from "../button-group/button-group-context.ts";
import { computeTargetAndRel } from "../link/compute-target-and-rel.ts";
import { useLinkComponent } from "../link/use-link-component.ts";
import { ButtonContent } from "./button-content.tsx";
import { createButtonClickHandler, createButtonTooltip } from "./button-interactions.ts";
import { groupStyles, sizeStyles, styles, variants } from "./button.stylex.ts";

function callConsumerHandler(handler: unknown, event: Event) {
  if (typeof handler === "function") handler(event);
}

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
  ref?: (element: HTMLButtonElement | HTMLAnchorElement) => void;
  label: string;
  children?: JSX.Element;
  icon?: JSX.Element;
  endContent?: JSX.Element;
  variant?: ButtonVariant;
  size?: ButtonSize;
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

/** Accessible action button. Async actions dedupe unless interruptible. */
export function Button(props: ButtonProps) {
  const merged = merge(
    {
      variant: "secondary" as ButtonVariant,
      type: "button" as const,
      isDisabled: false,
      isLoading: false,
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
    "class",
    "style",
    "ref",
  );

  const group = useButtonGroup();
  const inheritedSize = useSize();

  const [activeActions, setActiveActions] = createSignal(0);
  const size = createMemo(() => merged.size ?? inheritedSize());
  const variant = createMemo(() => merged.variant ?? "secondary");
  const loading = createMemo(() => merged.isLoading || activeActions() > 0);
  const disabled = createMemo(
    () => merged.isDisabled || group?.isDisabled || (loading() && !merged.isInterruptible),
  );
  const ariaDisabled = createMemo(() => merged.tooltip != null && disabled());
  const ariaLabel = createMemo(() =>
    merged.isIconOnly || loading() || merged.children != null ? merged.label : undefined,
  );
  const adapter = useLinkComponent(() => merged.as);
  const targetAndRel = createMemo(() => computeTargetAndRel(merged.target, merged.rel));
  const tooltip = createButtonTooltip(merged);
  const renderAsLink = createMemo(() => merged.href != null && !disabled());
  const component = createMemo(() => (renderAsLink() ? adapter() : "button"));

  const theme = createMemo(() => themeProps("button", { variant: variant(), size: size() }));
  const style = createMemo(() => {
    const currentSize = size();
    const currentVariant = variant();

    return stylexProps(
      styles.base,
      currentSize === "sm" && sizeStyles.sm,
      currentSize === "md" && sizeStyles.md,
      currentSize === "lg" && sizeStyles.lg,
      currentVariant === "primary" && variants.primary,
      currentVariant === "secondary" && variants.secondary,
      currentVariant === "ghost" && variants.ghost,
      currentVariant === "destructive" && variants.destructive,
      group == null && styles.pressable,
      group?.orientation === "horizontal" && groupStyles.horizontal,
      group?.orientation === "vertical" && groupStyles.vertical,
      merged.isIconOnly && styles.iconOnly,
      disabled() && styles.disabled,
      ariaDisabled() && styles.ariaDisabled,
      merged.xstyle,
    );
  });

  const onClick = createButtonClickHandler(props, disabled, setActiveActions);
  const onKeyDown = (event: KeyboardEvent) => {
    callConsumerHandler(props.onKeyDown, event);
    if (!event.defaultPrevented) {
      if (event.key === "Escape") tooltip.hide();
      if (ariaDisabled() && (event.key === "Enter" || event.key === " ")) event.preventDefault();
    }
  };

  return (
    <Dynamic
      component={component()}
      {...rest}
      {...theme()}
      ref={tooltip.setRoot}
      href={renderAsLink() ? merged.href : undefined}
      target={renderAsLink() ? targetAndRel().target : undefined}
      rel={renderAsLink() ? targetAndRel().rel : undefined}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...merged.style }}
      data-style-src={style()["data-style-src"]}
      type={renderAsLink() ? undefined : merged.type}
      name={renderAsLink() ? undefined : merged.name}
      value={renderAsLink() || merged.value == null ? undefined : String(merged.value)}
      form={renderAsLink() ? undefined : merged.form}
      formaction={renderAsLink() ? undefined : merged.formAction}
      formenctype={renderAsLink() ? undefined : merged.formEncType}
      formmethod={renderAsLink() ? undefined : merged.formMethod}
      formnovalidate={renderAsLink() ? undefined : merged.formNoValidate}
      formtarget={renderAsLink() ? undefined : merged.formTarget}
      disabled={renderAsLink() || ariaDisabled() ? undefined : disabled()}
      aria-busy={loading() ? "true" : undefined}
      aria-disabled={ariaDisabled() ? "true" : undefined}
      aria-label={ariaLabel()}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerEnter={(event: PointerEvent) => {
        callConsumerHandler(props.onPointerEnter, event);
        if (!event.defaultPrevented) tooltip.show();
      }}
      onPointerLeave={(event: PointerEvent) => {
        callConsumerHandler(props.onPointerLeave, event);
        if (!event.defaultPrevented) tooltip.hide();
      }}
      onFocus={(event: FocusEvent) => {
        callConsumerHandler(props.onFocus, event);
        if (!event.defaultPrevented) tooltip.show();
      }}
      onBlur={(event: FocusEvent) => {
        callConsumerHandler(props.onBlur, event);
        if (!event.defaultPrevented) tooltip.hide();
      }}
    >
      <ButtonContent button={merged} size={size()} loading={loading()} />
    </Dynamic>
  );
}
