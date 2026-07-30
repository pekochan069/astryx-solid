import type { JSX } from "@solidjs/web";

import { createSignal, merge, onCleanup, onSettled } from "solid-js";

import { stylexProps } from "../../stylex";
import {
  OverlayScrim,
  type OverlayAlign,
  type OverlayPosition,
  type OverlayScrimMode,
  type OverlayShowOn,
} from "./overlay-scrim";
import { overlayContainerStyles, overlayScope } from "./overlay.markers.stylex";

export interface UseOverlayOptions {
  content?: JSX.Element;
  showOn?: OverlayShowOn;
  isOpen?: boolean;
  scrim?: OverlayScrimMode;
  position?: OverlayPosition;
  align?: OverlayAlign;
}

export interface OverlayContainerProps {
  class?: string;
  style?: JSX.CSSProperties;
  onClick?: (event: MouseEvent) => void;
}

export interface UseOverlayResult {
  containerRef: (element: HTMLElement) => void;
  containerProps: OverlayContainerProps;
  element: JSX.Element | null;
  renderOverlay: (children: JSX.Element) => JSX.Element;
}

export function useOverlay(props: UseOverlayOptions): UseOverlayResult {
  const merged = merge(
    {
      showOn: "always",
      scrim: "dark",
      position: "fill",
      align: "end",
    } satisfies Partial<UseOverlayOptions>,
    props,
  );

  const [touch, setTouch] = createSignal(false);
  const [touchDevice, setTouchDevice] = createSignal(false);
  let container: HTMLElement | undefined;

  onSettled(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(hover: none)");
    setTouchDevice(media.matches);
    const listener = () => setTouchDevice(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  });

  onCleanup(() => {
    container = undefined;
  });

  const touchToggle = (event: MouseEvent) => {
    if (event.target !== container || !touchDevice() || merged.showOn !== "hover") return;
    setTouch((value) => !value);
  };
  const effectiveOpen = () =>
    merged.isOpen ?? (touchDevice() && merged.showOn === "hover" ? touch() : undefined);

  const style = stylexProps(overlayScope, overlayContainerStyles.root);

  const renderOverlay = (children: JSX.Element) => (
    <OverlayScrim
      scrim={merged.scrim}
      position={merged.position}
      align={merged.align}
      showOn={merged.showOn}
      isOpen={effectiveOpen()}
    >
      {children}
    </OverlayScrim>
  );

  return {
    containerRef: (element) => {
      container = element;
    },
    containerProps: { class: style.class, style: style.style, onClick: touchToggle },
    element: merged.content == null ? null : renderOverlay(merged.content),
    renderOverlay,
  };
}
