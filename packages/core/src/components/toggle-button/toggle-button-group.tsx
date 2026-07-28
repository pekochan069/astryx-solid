import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createContext, createMemo, omit, useContext } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { ButtonSize } from "../button/button.tsx";

import { SizeContext } from "../../size-context/size-context.ts";
import { stylexProps } from "../../stylex/index.ts";
import { spacingVars } from "../../theme/tokens.stylex.ts";
import { themeProps } from "../../utils/theme-props.ts";

interface GroupContext {
  selected: () => ReadonlySet<string>;
  toggle: (value: string) => void;
  readonly size?: ButtonSize;
  readonly isDisabled?: boolean;
}
const ToggleButtonGroupContext = createContext<GroupContext | null>(null);
export function useToggleButtonGroup() {
  return useContext(ToggleButtonGroupContext);
}

const styles = stylex.create({
  group: { display: "inline-flex", "align-items": "center", gap: spacingVars["--spacing-1"] },
  vertical: { "flex-direction": "column", "align-items": "stretch" },
});
interface Base extends Omit<BaseProps<HTMLDivElement>, "onChange" | "type"> {
  children: JSX.Element;
  label: string;
  size?: ButtonSize;
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  ref?: (element: HTMLDivElement) => void;
}
export interface ToggleButtonGroupSingleProps extends Base {
  type?: "single";
  value: string | null;
  onChange: (value: string | null) => void;
}
export interface ToggleButtonGroupMultipleProps extends Base {
  type: "multiple";
  value: readonly string[];
  onChange: (value: readonly string[]) => void;
}
export type ToggleButtonGroupProps = ToggleButtonGroupSingleProps | ToggleButtonGroupMultipleProps;

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  const rest = omit(
    props,
    "children",
    "label",
    "orientation",
    "size",
    "isDisabled",
    "type",
    "value",
    "onChange",
    "xstyle",
    "class",
    "style",
    "ref",
  );
  const selected = createMemo(
    () =>
      new Set(props.type === "multiple" ? props.value : props.value == null ? [] : [props.value]),
  );

  const style = createMemo(() =>
    stylexProps(styles.group, props.orientation === "vertical" && styles.vertical, props.xstyle),
  );

  const toggle = (value: string) => {
    if (props.type === "multiple")
      props.onChange(
        selected().has(value)
          ? props.value.filter((item) => item !== value)
          : [...props.value, value],
      );
    else props.onChange(props.value === value ? null : value);
  };
  const context = {
    selected,
    toggle,
    get size() {
      return props.size;
    },
    get isDisabled() {
      return props.isDisabled;
    },
  };

  return (
    <ToggleButtonGroupContext value={context}>
      <SizeContext
        value={{
          get size() {
            return props.size ?? null;
          },
        }}
      >
        <div
          {...rest}
          {...themeProps("toggle-button-group")}
          ref={(element) => {
            props.ref?.(element);
          }}
          class={[style().class, props.class]}
          style={{ ...style().style, ...props.style }}
          data-style-src={style()["data-style-src"]}
          role="group"
          aria-label={props.label}
          data-orientation={props.orientation ?? "horizontal"}
        >
          {props.children}
        </div>
      </SizeContext>
    </ToggleButtonGroupContext>
  );
}
