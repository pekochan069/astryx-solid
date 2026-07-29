import type { JSX } from "@solidjs/web";

import { mergeProps } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props.ts";
import type { ButtonSize } from "../button/button.tsx";

import { SizeContext } from "../../size-context/size-context.ts";
import { stylexProps } from "../../stylex/index.ts";
import { themeProps } from "../../utils/theme-props.ts";
import { ButtonGroupContext, type ButtonGroupOrientation } from "./button-group-context.ts";

const styles = stylex.create({
  group: { display: "inline-flex", "align-items": "stretch" },
  vertical: { "flex-direction": "column" },
});

export interface ButtonGroupProps extends BaseProps<HTMLDivElement> {
  label: string;
  children: JSX.Element;
  orientation?: ButtonGroupOrientation;
  size?: ButtonSize;
  isDisabled?: boolean;
  ref?: (element: HTMLDivElement) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

/** Connected Button roots with native tab order and arrow-key focus movement. */
export function ButtonGroup(props: ButtonGroupProps) {
  const merged = mergeProps(
    { orientation: "horizontal", isDisabled: false } satisfies Partial<ButtonGroupProps>,
    props,
  );
  const rest = omit(
    merged,
    "children",
    "label",
    "orientation",
    "size",
    "isDisabled",
    "onKeyDown",
    "xstyle",
    "class",
    "style",
    "ref",
  );
  const style = createMemo(() =>
    stylexProps(styles.group, merged.orientation === "vertical" && styles.vertical, merged.xstyle),
  );

  const moveFocus = (event: KeyboardEvent) => {
    merged.onKeyDown?.(event);
    const canNavigate =
      !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey;

    if (canNavigate) {
      const keys =
        merged.orientation === "vertical" ? ["ArrowDown", "ArrowUp"] : ["ArrowRight", "ArrowLeft"];
      const isNavigationKey = [...keys, "Home", "End"].includes(event.key);

      if (isNavigationKey && event.currentTarget instanceof HTMLElement) {
        const root = event.currentTarget;
        const items = [
          ...root.querySelectorAll<HTMLElement>(
            "button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])",
          ),
        ].filter((item) => item.getAttribute("aria-disabled") !== "true");
        const current = items.indexOf(
          document.activeElement instanceof HTMLElement ? document.activeElement : root,
        );
        const next =
          event.key === "Home"
            ? items[0]
            : event.key === "End"
              ? items.at(-1)
              : items[(current + (event.key === keys[0] ? 1 : -1) + items.length) % items.length];

        if (next != null) {
          event.preventDefault();
          next.focus();
        }
      }
    }
  };

  const context = {
    get orientation() {
      return merged.orientation;
    },
    get isDisabled() {
      return merged.isDisabled;
    },
  };

  return (
    <ButtonGroupContext value={context}>
      <SizeContext
        value={{
          get size() {
            return merged.size ?? null;
          },
        }}
      >
        <div
          {...rest}
          ref={(element) => {
            merged.ref?.(element);
          }}
          {...themeProps("button-group", { orientation: merged.orientation, size: merged.size })}
          class={[style().class, merged.class]}
          style={{ ...style().style, ...merged.style }}
          data-style-src={style()["data-style-src"]}
          role="group"
          aria-label={merged.label}
          aria-disabled={merged.isDisabled ? "true" : undefined}
          onKeyDown={moveFocus}
        >
          {merged.children}
        </div>
      </SizeContext>
    </ButtonGroupContext>
  );
}
