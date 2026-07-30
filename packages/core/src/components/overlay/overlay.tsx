import type { JSX } from "@solidjs/web";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";
import { overlayContainerStyles, overlayScope } from "./overlay.markers.stylex";
import { useOverlay, type UseOverlayOptions } from "./use-overlay";

export interface OverlayProps extends BaseProps<HTMLDivElement>, UseOverlayOptions {
  children?: JSX.Element;
}

export function Overlay(props: OverlayProps) {
  const overlay = useOverlay(props);

  const style = stylexProps(overlayScope, overlayContainerStyles.root, props.xstyle);

  return (
    <div
      {...themeProps("overlay")}
      {...overlay.containerProps}
      ref={(element) => {
        overlay.containerRef(element);
        setElementRef(props.ref, element);
      }}
      class={[style.class, props.class]}
      style={{ ...style.style, ...props.style }}
    >
      {props.children}
      {overlay.element}
    </div>
  );
}
