import type { Accessor, Setter } from "solid-js";

import { createSignal, createUniqueId, onCleanup } from "solid-js";

import type { ButtonProps } from "./button.tsx";

import { setElementRef } from "../../utils/set-element-ref.ts";

const HOVER_SHOW_DELAY = 200;
const HOVER_BRIDGE_DELAY = 100;

export function createButtonTooltip(props: ButtonProps) {
  const id = `button-tooltip-${createUniqueId()}`;
  const anchorName = `--${id}`;
  const [visible, setVisible] = createSignal(false);
  let element: HTMLSpanElement | undefined;
  let showTimeout: ReturnType<typeof setTimeout> | undefined;
  let hideTimeout: ReturnType<typeof setTimeout> | undefined;

  const clearTimeouts = () => {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    showTimeout = undefined;
    hideTimeout = undefined;
  };
  const describedBy = () =>
    props.tooltip == null
      ? props["aria-describedby"]
      : [props["aria-describedby"], id].filter(Boolean).join(" ") || undefined;
  const isPopoverOpen = () => {
    try {
      return element?.matches(":popover-open") ?? false;
    } catch {
      return false;
    }
  };
  const openPopover = () => {
    if (
      visible() &&
      element != null &&
      !isPopoverOpen() &&
      typeof element.showPopover === "function"
    ) {
      element.showPopover();
    }
  };
  const reveal = () => {
    if (props.tooltip != null) {
      setVisible(true);
      queueMicrotask(openPopover);
    }
  };
  const hide = () => {
    clearTimeouts();
    if (isPopoverOpen() && typeof element?.hidePopover === "function") element.hidePopover();
    setVisible(false);
  };
  const show = () => {
    clearTimeouts();
    reveal();
  };
  const scheduleShow = () => {
    if (globalThis.matchMedia?.("(hover: none)").matches) return;
    clearTimeouts();
    showTimeout = setTimeout(reveal, HOVER_SHOW_DELAY);
  };
  const scheduleHide = () => {
    clearTimeouts();
    hideTimeout = setTimeout(hide, HOVER_BRIDGE_DELAY);
  };
  const cancelHide = () => {
    clearTimeout(hideTimeout);
    hideTimeout = undefined;
  };
  const setRoot = (root: HTMLButtonElement | HTMLAnchorElement) => {
    setElementRef(props.ref, root);
  };
  const setElement = (node: HTMLSpanElement) => {
    element = node;
    if (visible()) queueMicrotask(openPopover);
  };

  onCleanup(clearTimeouts);

  return {
    anchorName,
    cancelHide,
    describedBy,
    hide,
    id,
    scheduleHide,
    scheduleShow,
    setElement,
    setRoot,
    show,
    visible,
  };
}

export function createButtonClickHandler(
  props: ButtonProps,
  disabled: Accessor<boolean>,
  setActiveActions: Setter<number>,
) {
  let locked = false;

  return (event: MouseEvent) => {
    if (disabled() || (locked && !props.isInterruptible)) {
      event.preventDefault();
      return;
    }

    props.onClick?.(event);
    if (props.clickAction == null || event.defaultPrevented) return;

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
  };
}
