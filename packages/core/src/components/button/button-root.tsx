import type { JSX } from "@solidjs/web";

import { Dynamic } from "@solidjs/web";
import { Show } from "solid-js";

import type { SizeValue } from "../../types/size-value.types.ts";
import type { LinkComponent } from "../link/link-provider.tsx";
import type { createButtonTooltip } from "./button-interactions.ts";
import type { ButtonProps, ButtonSize } from "./button.tsx";

import { size } from "../../utils/size.ts";
import { ButtonContent } from "./button-content.tsx";

interface ButtonRootProps {
  button: ButtonProps;
  rest: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  adapter: LinkComponent;
  renderAsLink: boolean;
  disabled: boolean;
  ariaDisabled: boolean;
  loading: boolean;
  delaySpinner: boolean;
  size: ButtonSize;
  variant: string;
  target?: string;
  rel?: string;
  theme: Record<string, string | undefined>;
  stylexClass?: string;
  stylexStyle?: Readonly<Record<string, string | number>>;
  width?: SizeValue;
  dataStyleSrc?: string;
  ariaLabel?: string | false;
  tooltip: ReturnType<typeof createButtonTooltip>;
  onClick: (event: MouseEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

export function ButtonRoot(props: ButtonRootProps) {
  const rootStyle = () => ({
    ...props.stylexStyle,
    width: props.width == null ? undefined : size(props.width),
    "anchor-name": props.button.tooltip == null ? undefined : props.tooltip.anchorName,
    ...props.button.style,
  });

  const onPointerEnter = (event: PointerEvent) => {
    callConsumerHandler(props.button.onPointerEnter, event);
    if (!event.defaultPrevented) props.tooltip.scheduleShow();
  };
  const onPointerLeave = (event: PointerEvent) => {
    callConsumerHandler(props.button.onPointerLeave, event);
    if (!event.defaultPrevented) props.tooltip.scheduleHide();
  };
  const onFocus = (event: FocusEvent) => {
    callConsumerHandler(props.button.onFocus, event);
    if (!event.defaultPrevented) props.tooltip.show();
  };
  const onBlur = (event: FocusEvent) => {
    callConsumerHandler(props.button.onBlur, event);
    if (!event.defaultPrevented) props.tooltip.scheduleHide();
  };

  return (
    <Show
      when={props.renderAsLink}
      fallback={
        <button
          {...props.rest}
          {...props.theme}
          ref={props.tooltip.setRoot}
          class={[props.theme.class, props.stylexClass, props.button.class]}
          style={rootStyle()}
          data-style-src={props.dataStyleSrc}
          data-astryx-edge-comp={props.variant === "ghost" ? "" : undefined}
          type={props.button.type ?? "button"}
          name={props.button.name}
          value={props.button.value == null ? undefined : String(props.button.value)}
          form={props.button.form}
          formaction={props.button.formAction}
          formenctype={props.button.formEncType}
          formmethod={props.button.formMethod}
          formnovalidate={props.button.formNoValidate}
          formtarget={props.button.formTarget}
          disabled={props.ariaDisabled ? undefined : props.disabled}
          aria-busy={props.loading ? "true" : undefined}
          aria-disabled={props.ariaDisabled ? "true" : undefined}
          aria-label={props.ariaLabel}
          aria-describedby={props.tooltip.describedBy()}
          onClick={props.onClick}
          onKeyDown={props.onKeyDown}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <ButtonContent
            button={props.button}
            size={props.size}
            loading={props.loading}
            delaySpinner={props.delaySpinner}
          />
        </button>
      }
    >
      <Dynamic
        component={props.adapter}
        {...(props.rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
        {...props.theme}
        ref={props.tooltip.setRoot}
        class={[props.theme.class, props.stylexClass, props.button.class]}
        style={rootStyle()}
        data-style-src={props.dataStyleSrc}
        data-astryx-edge-comp={props.variant === "ghost" ? "" : undefined}
        href={props.button.href}
        target={props.target}
        rel={props.rel}
        aria-busy={props.loading ? "true" : undefined}
        aria-label={props.ariaLabel}
        aria-describedby={props.tooltip.describedBy()}
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <ButtonContent
          button={props.button}
          size={props.size}
          loading={props.loading}
          delaySpinner={props.delaySpinner}
        />
      </Dynamic>
    </Show>
  );
}

function callConsumerHandler(handler: unknown, event: Event) {
  if (typeof handler === "function") handler(event);
}
