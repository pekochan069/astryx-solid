import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal, createUniqueId, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, durationVars } from "../../theme/tokens.stylex";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";

export interface StatusDotVariantMap {
  success: true;
  warning: true;
  error: true;
  accent: true;
  neutral: true;
}

export type StatusDotVariant = keyof StatusDotVariantMap;

export interface StatusDotProps extends BaseProps<HTMLSpanElement> {
  variant: StatusDotVariant;
  label: string;
  isPulsing?: boolean;
  tooltip?: string;
}

type StatusDotEvent<EventType extends Event> = EventType & {
  currentTarget: HTMLSpanElement;
  target: Element;
};

type StatusDotHandler<EventType extends Event> = JSX.EventHandlerUnion<HTMLSpanElement, EventType>;

function invokeHandler<EventType extends Event>(
  handler: StatusDotHandler<EventType> | undefined,
  event: StatusDotEvent<EventType>,
) {
  if (handler === undefined) return;
  if (typeof handler === "function") handler(event);
  else handler[0](handler[1], event);
}

const pulse = stylex.keyframes({
  "0%": { opacity: 1 },
  "50%": { opacity: 0.5 },
  "100%": { opacity: 1 },
});

const styles = stylex.create({
  root: {
    position: "relative",
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  tooltip: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    zIndex: 1,
    paddingInline: 8,
    paddingBlock: 4,
    borderRadius: 4,
    backgroundColor: colorVars["--color-background-inverted"],
    color: colorVars["--color-on-dark"],
    whiteSpace: "nowrap",
    pointerEvents: "none",
  },
  pulsing: {
    animationName: { default: pulse, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: durationVars["--duration-slow-min"],
    animationIterationCount: "infinite",
  },
  success: { backgroundColor: colorVars["--color-success"] },
  warning: { backgroundColor: colorVars["--color-warning"] },
  error: { backgroundColor: colorVars["--color-error"] },
  accent: { backgroundColor: colorVars["--color-accent"] },
  neutral: { backgroundColor: colorVars["--color-icon-secondary"] },
});

export function StatusDot(props: StatusDotProps) {
  const rest = omit(
    props,
    "variant",
    "label",
    "isPulsing",
    "tooltip",
    "xstyle",
    "class",
    "style",
    "onPointerEnter",
    "onPointerLeave",
    "onFocus",
    "onBlur",
    "onKeyDown",
    "ref",
  );

  const [isTooltipVisible, setTooltipVisible] = createSignal(false);
  const tooltipId = `status-dot-tooltip-${createUniqueId()}`;
  const hideTooltip = () => setTooltipVisible(false);
  const showTooltip = () => setTooltipVisible(props.tooltip !== undefined);

  const onPointerEnter = (event: StatusDotEvent<PointerEvent>) => {
    showTooltip();
    invokeHandler(props.onPointerEnter, event);
  };
  const onPointerLeave = (event: StatusDotEvent<PointerEvent>) => {
    hideTooltip();
    invokeHandler(props.onPointerLeave, event);
  };
  const onFocus = (event: StatusDotEvent<FocusEvent>) => {
    showTooltip();
    invokeHandler(props.onFocus, event);
  };
  const onBlur = (event: StatusDotEvent<FocusEvent>) => {
    hideTooltip();
    invokeHandler(props.onBlur, event);
  };
  const onKeyDown = (event: StatusDotEvent<KeyboardEvent>) => {
    if (event.key === "Escape") hideTooltip();
    invokeHandler(props.onKeyDown, event);
  };
  const setElement = (element: HTMLSpanElement) => setElementRef(props.ref, element);

  const theme = createMemo(() => themeProps("statusdot", { variant: props.variant }));
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      styles[props.variant],
      props.isPulsing && styles.pulsing,
      props.xstyle,
    ),
  );

  return (
    <span
      {...rest}
      {...theme()}
      ref={setElement}
      role="img"
      aria-label={props.label}
      aria-describedby={isTooltipVisible() ? tooltipId : undefined}
      tabindex={props.tooltip === undefined ? -1 : 0}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <Show when={isTooltipVisible()}>
        <span
          id={tooltipId}
          role="tooltip"
          class={stylexProps(styles.tooltip).class}
          textContent={props.tooltip}
        />
      </Show>
    </span>
  );
}
