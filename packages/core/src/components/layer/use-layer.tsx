import { Dynamic, type JSX } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createSignal, createUniqueId, onCleanup, createEffect } from "solid-js";

import { stylexProps } from "../../stylex";
import { addAnchorName, removeAnchorName } from "./anchor-name";
import { layerStyles } from "./layer.stylex";
import { captureFocus, type FocusRecord } from "./ownership/focus-restoration";
import { registerLayer } from "./ownership/layer-stack";
import { lockScroll } from "./ownership/scroll-lock";

export type LayerPlacement = "above" | "below" | "start" | "end";
export type LayerAlignment = "start" | "center" | "end";

interface BaseLayerOptions {
  onShow?: () => void;
  onHide?: () => void;
  lightDismiss?: boolean;
  lockScroll?: boolean;
}

export interface ContextLayerOptions extends BaseLayerOptions {
  mode: "context";
}
export interface FixedLayerOptions extends BaseLayerOptions {
  mode: "fixed";
}
export interface ContextRenderProps {
  positioning?: "anchor" | "custom";
  placement?: LayerPlacement;
  alignment?: LayerAlignment;
  role?: JSX.HTMLAttributes<HTMLElement>["role"];
  "aria-label"?: string;
  xstyle?: stylex.StyleXStyles;
  class?: string;
  style?: JSX.CSSProperties;
  as?: "div" | "span";
}
export interface FixedRenderProps {
  x: number;
  y: number;
  role?: JSX.HTMLAttributes<HTMLElement>["role"];
  "aria-label"?: string;
  xstyle?: stylex.StyleXStyles;
  class?: string;
  style?: JSX.CSSProperties;
}

export interface ContextLayerReturn {
  ref: (element: HTMLElement) => void;
  anchorId: string;
  show: () => void;
  hide: () => void;
  isOpen: () => boolean;
  id: string;
  render: (children: JSX.Element, props?: ContextRenderProps) => JSX.Element;
}
export interface FixedLayerReturn {
  ref: undefined;
  show: () => void;
  hide: () => void;
  isOpen: () => boolean;
  id: string;
  render: (children: JSX.Element, props: FixedRenderProps) => JSX.Element;
}

function positionArea(placement: LayerPlacement, alignment: LayerAlignment): string {
  if (placement === "above" || placement === "below") {
    const block = placement === "above" ? "self-block-start" : "self-block-end";
    return alignment === "center"
      ? block
      : `${block} span-self-inline-${alignment === "start" ? "end" : "start"}`;
  }
  const inline = placement === "start" ? "self-inline-start" : "self-inline-end";
  return alignment === "center"
    ? inline
    : `${inline} span-self-block-${alignment === "start" ? "end" : "start"}`;
}

function popoverMethod(element: HTMLElement, method: "showPopover" | "hidePopover") {
  const candidate = element as HTMLElement & { [key: string]: unknown };
  const operation = candidate[method];
  if (typeof operation !== "function") return;
  try {
    operation.call(element);
  } catch {
    // Unsupported or already-closed native popovers still use managed state.
  }
}

function watchLayer(isOpen: () => boolean, activate: () => void): void {
  createEffect(() => isOpen(), activate);
}

function cleanupLayer(
  dispose: () => void,
  clearOwnership: () => void,
  getTrigger: () => HTMLElement | undefined,
  anchorId: string,
  getHost: () => HTMLElement | undefined,
): void {
  onCleanup(() => {
    dispose();
    clearOwnership();
    const trigger = getTrigger();
    const host = getHost();
    if (trigger) removeAnchorName(trigger, anchorId);
    if (host) popoverMethod(host, "hidePopover");
  });
}

function renderLayer(
  mode: "context" | "fixed",
  layerId: string,
  open: boolean,
  setHost: (element: HTMLElement) => void,
  children: JSX.Element,
  renderProps: ContextRenderProps | FixedRenderProps,
): JSX.Element {
  const context = mode === "context" ? (renderProps as ContextRenderProps) : undefined;
  const fixed = mode === "fixed" ? (renderProps as FixedRenderProps) : undefined;
  const style =
    context?.positioning !== "custom" && context
      ? {
          "position-anchor": `--${layerId}`,
          "position-area": positionArea(
            context.placement ?? "above",
            context.alignment ?? "center",
          ),
        }
      : fixed
        ? { left: `${fixed.x}px`, top: `${fixed.y}px` }
        : {};
  const mergedStyle = { ...style, ...(context?.style ?? fixed?.style) } as JSX.CSSProperties;
  const user = context ?? fixed ?? {};
  const classes = stylexProps(layerStyles.base, mode === "fixed" && layerStyles.fixed, user.xstyle);
  const Tag = context?.as ?? "div";

  return (
    <Dynamic
      component={Tag}
      ref={setHost}
      id={layerId}
      popover="manual"
      hidden={!open}
      role={user.role}
      aria-label={user["aria-label"]}
      style={mergedStyle}
      class={[classes.class, user.class]}
      data-layer={layerId}
    >
      {children}
    </Dynamic>
  );
}

export function useLayer(options: ContextLayerOptions): ContextLayerReturn;
export function useLayer(options: FixedLayerOptions): FixedLayerReturn;
export function useLayer(
  options: ContextLayerOptions | FixedLayerOptions,
): ContextLayerReturn | FixedLayerReturn {
  const id = createUniqueId();
  const layerId = `astryx-layer-${id.replaceAll(":", "")}`;
  const anchorId = `--${layerId}`;
  const [isOpen, setIsOpen] = createSignal(false);
  let host: HTMLElement | undefined;
  let releaseStack: (() => void) | undefined;
  let releaseLock: (() => void) | undefined;
  let focus: FocusRecord | undefined;
  let removeToggleListener: (() => void) | undefined;
  let previousTrigger: HTMLElement | undefined;
  let disposed = false;

  const clearOwnership = () => {
    releaseStack?.();
    releaseStack = undefined;
    releaseLock?.();
    releaseLock = undefined;
    removeToggleListener?.();
    removeToggleListener = undefined;
    if (host && focus) focus.restore(host);
    focus = undefined;
  };

  const hide = () => {
    if (!isOpen()) return;
    setIsOpen(false);
    if (host) popoverMethod(host, "hidePopover");
    clearOwnership();
    options.onHide?.();
  };

  const activate = () => {
    if (!host || !isOpen() || releaseStack) return;
    const ownerDocument = host.ownerDocument;
    focus = captureFocus(ownerDocument);
    releaseStack = registerLayer(ownerDocument, {
      host,
      lightDismiss: options.lightDismiss ?? false,
      close: hide,
    });
    if (options.lockScroll) releaseLock = lockScroll(ownerDocument);
    const onToggle = (event: Event) => {
      if (Reflect.get(event, "newState") === "closed" && isOpen()) hide();
    };
    const activeHost = host;
    activeHost.addEventListener("toggle", onToggle);
    removeToggleListener = () => activeHost.removeEventListener("toggle", onToggle);
    popoverMethod(activeHost, "showPopover");
  };

  const show = () => {
    if (disposed || isOpen()) return;
    setIsOpen(true);
    options.onShow?.();
    activate();
  };

  const setHost = (element: HTMLElement) => {
    host = element;
    activate();
  };

  const ref = (element: HTMLElement) => {
    if (previousTrigger && previousTrigger !== element) removeAnchorName(previousTrigger, anchorId);
    previousTrigger = element;
    addAnchorName(element, anchorId);
  };

  watchLayer(isOpen, activate);
  cleanupLayer(
    () => {
      disposed = true;
    },
    clearOwnership,
    () => previousTrigger,
    anchorId,
    () => host,
  );

  const render = (children: JSX.Element, renderProps: ContextRenderProps | FixedRenderProps) =>
    renderLayer(options.mode, layerId, isOpen(), setHost, children, renderProps);

  if (options.mode === "context")
    return {
      ref,
      anchorId,
      show,
      hide,
      isOpen,
      id: layerId,
      render: render as ContextLayerReturn["render"],
    };
  return {
    ref: undefined,
    show,
    hide,
    isOpen,
    id: layerId,
    render: render as FixedLayerReturn["render"],
  };
}
