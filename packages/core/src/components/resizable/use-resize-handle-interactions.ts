import { createSignal, onCleanup } from "solid-js";

import type { ResizableProps } from "./resizable";

interface UseResizeHandleInteractionsOptions {
  props: {
    isDisabled?: boolean;
    onKeyDown?: (event: KeyboardEvent) => void;
    resizable?: ResizableProps;
  };
  horizontal: () => boolean;
  multiplier: () => number;
}

function resizeBy(resizable: ResizableProps, delta: number) {
  resizable._onResizeStart();
  resizable._onResizeMove(delta);
  resizable._onResizeEnd();
}

function toggleResizable(resizable: ResizableProps) {
  resizeBy(resizable, resizable._isCollapsed ? resizable._minSizePx : -resizable._size);
}

function resizeFromKey(
  event: KeyboardEvent,
  resizable: ResizableProps,
  horizontal: boolean,
  multiplier: number,
) {
  const step = event.shiftKey ? 50 : 10;
  const positive = horizontal ? event.key === "ArrowRight" : event.key === "ArrowDown";
  const negative = horizontal ? event.key === "ArrowLeft" : event.key === "ArrowUp";

  if (positive || negative) {
    event.preventDefault();
    resizeBy(resizable, (positive ? step : -step) * multiplier);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    resizeBy(resizable, resizable._minSizePx - resizable._size);
    return;
  }

  if (event.key === "End" && Number.isFinite(resizable._maxSizePx)) {
    event.preventDefault();
    resizeBy(resizable, resizable._maxSizePx - resizable._size);
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && resizable._collapsible) {
    event.preventDefault();
    toggleResizable(resizable);
  }
}

export function useResizeHandleInteractions(options: UseResizeHandleInteractionsOptions) {
  const [dragging, setDragging] = createSignal(false);
  const [interacting, setInteracting] = createSignal(false);
  const [dragController, setDragController] = createSignal<AbortController>();

  const finish = (complete: boolean) => {
    dragController()?.abort();
    setDragController(undefined);
    setDragging(false);

    if (typeof document !== "undefined") {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    if (complete) options.props.resizable?._onResizeEnd();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (options.props.isDisabled || !options.props.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    const start = options.horizontal() ? event.clientX : event.clientY;
    const sign = options.multiplier();

    setDragging(true);
    options.props.resizable._onResizeStart();
    document.body.style.cursor = options.horizontal() ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";

    const move = (next: PointerEvent) =>
      options.props.resizable?._onResizeMove(
        ((options.horizontal() ? next.clientX : next.clientY) - start) * sign,
      );
    const controller = new AbortController();
    const listenerOptions = { signal: controller.signal };

    setDragController(controller);
    window.addEventListener("pointermove", move, listenerOptions);
    window.addEventListener("pointerup", () => finish(true), listenerOptions);
    window.addEventListener("pointercancel", () => finish(false), listenerOptions);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    options.props.onKeyDown?.(event);

    if (event.defaultPrevented || options.props.isDisabled || !options.props.resizable) return;

    resizeFromKey(event, options.props.resizable, options.horizontal(), options.multiplier());
  };

  onCleanup(() => finish(false));

  return { dragging, interacting, setInteracting, onPointerDown, onKeyDown, toggleResizable };
}
