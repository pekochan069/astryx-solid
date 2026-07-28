import type { Accessor, Setter } from "solid-js";

import { createUniqueId } from "solid-js";

import type { ButtonProps } from "./button.tsx";

import { setElementRef } from "../../utils/set-element-ref.ts";

export function createButtonTooltip(props: ButtonProps) {
  const tooltipId = `button-tooltip-${createUniqueId()}`;
  let root: HTMLButtonElement | HTMLAnchorElement | undefined;
  let tooltipNode: HTMLSpanElement | undefined;

  const hide = () => {
    tooltipNode?.remove();
    tooltipNode = undefined;
    root?.removeAttribute("aria-describedby");
  };

  const show = () => {
    if (root != null && tooltipNode == null && props.tooltip != null) {
      tooltipNode = document.createElement("span");
      tooltipNode.id = tooltipId;
      tooltipNode.role = "tooltip";
      tooltipNode.textContent = props.tooltip;
      tooltipNode.style.position = "absolute";
      tooltipNode.style.insetBlockEnd = "100%";
      root.append(tooltipNode);
      root.setAttribute("aria-describedby", tooltipId);
    }
  };

  const setRoot = (element: HTMLButtonElement | HTMLAnchorElement) => {
    root = element;
    setElementRef(props.ref, element);
  };

  return { hide, show, setRoot };
}

export function createButtonClickHandler(
  props: ButtonProps,
  disabled: Accessor<boolean>,
  setActiveActions: Setter<number>,
) {
  let locked = false;

  return (event: MouseEvent) => {
    const blocked = disabled() || (locked && !props.isInterruptible);

    if (blocked) {
      event.preventDefault();
    } else {
      props.onClick?.(event);

      if (props.clickAction && !event.defaultPrevented) {
        locked = true;
        setActiveActions((count) => count + 1);
        const finish = () => {
          locked = false;
          setActiveActions((count) => count - 1);
        };
        let result: void | Promise<void>;

        try {
          result = props.clickAction(event);
        } catch (error) {
          finish();
          throw error;
        }

        void Promise.resolve(result).then(finish, (error) => {
          finish();
          queueMicrotask(() => {
            throw error;
          });
        });
      }
    }
  };
}
