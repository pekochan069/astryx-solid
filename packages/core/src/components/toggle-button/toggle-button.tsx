import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

import { createMemo, createSignal, omit } from "solid-js";

import { colorVars, fontWeightVars } from "../../theme/tokens.stylex.ts";
import { Button, type ButtonProps } from "../button/button.tsx";
import { useToggleButtonGroup } from "./toggle-button-group.tsx";

type ToggleButtonGroup = ReturnType<typeof useToggleButtonGroup>;

export interface ToggleButtonProps extends Omit<
  ButtonProps,
  "onClick" | "clickAction" | "variant"
> {
  isPressed?: boolean;
  onPressedChange?: (pressed: boolean, event: MouseEvent) => void;
  pressedChangeAction?: (pressed: boolean) => void | Promise<void>;
  pressedIcon?: JSX.Element;
  value?: string;
}

interface ToggleButtonState {
  pressed: Accessor<boolean>;
  disabled: Accessor<boolean | undefined>;
  onClick: (event: MouseEvent) => void;
  action: () => Promise<void>;
}

function createToggleButtonState(
  props: ToggleButtonProps,
  group: ToggleButtonGroup,
): ToggleButtonState {
  const committed = createMemo(() =>
    group != null && props.value != null
      ? group.selected().has(props.value)
      : (props.isPressed ?? false),
  );
  const [intent, setIntent] = createSignal<boolean>();
  const [latestAction, setLatestAction] = createSignal(0);
  let optimisticIntent: boolean | undefined;
  let pendingIntent: boolean | undefined;
  const pressed = createMemo(() => intent() ?? committed());
  const disabled = createMemo(() => group?.isDisabled ?? props.isDisabled);
  const next = () => !(optimisticIntent ?? committed());

  const onClick = (event: MouseEvent) => {
    if (!disabled()) {
      if (group != null && props.value != null) {
        group.toggle(props.value);
        event.preventDefault();
      } else {
        const value = next();
        pendingIntent = value;
        props.onPressedChange?.(value, event);
      }
    }
  };
  const action = async () => {
    const value = pendingIntent ?? next();
    pendingIntent = undefined;
    const version = latestAction() + 1;
    setLatestAction(version);
    optimisticIntent = value;
    setIntent(value);

    try {
      await props.pressedChangeAction?.(value);
    } finally {
      if (version === latestAction()) {
        optimisticIntent = undefined;
        setIntent();
      }
    }
  };

  return { pressed, disabled, onClick, action };
}

/** Controlled toggle. Re-clicks derive from newest optimistic intent. */
export function ToggleButton(props: ToggleButtonProps) {
  const rest = omit(
    props,
    "isPressed",
    "onPressedChange",
    "pressedChangeAction",
    "pressedIcon",
    "value",
  );

  const group = useToggleButtonGroup();

  const state = createToggleButtonState(props, group);
  const icon = createMemo(() =>
    state.pressed() && props.pressedIcon != null ? props.pressedIcon : props.icon,
  );
  const tooltip = createMemo(() =>
    props.isIconOnly ? (props.tooltip ?? props.label) : props.tooltip,
  );

  return (
    <Button
      {...rest}
      variant="ghost"
      style={{
        "background-color": state.pressed() ? colorVars["--color-overlay-pressed"] : undefined,
        "font-weight": state.pressed() ? fontWeightVars["--font-weight-semibold"] : undefined,
        ...props.style,
      }}
      isDisabled={state.disabled()}
      isInterruptible
      aria-pressed={state.pressed() ? "true" : "false"}
      icon={icon()}
      tooltip={tooltip()}
      onClick={state.onClick}
      clickAction={
        group != null && props.value != null
          ? undefined
          : props.pressedChangeAction != null
            ? state.action
            : undefined
      }
    />
  );
}
