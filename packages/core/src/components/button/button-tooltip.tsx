import * as stylex from "@stylexjs/stylex";

import type { createButtonTooltip } from "./button-interactions.ts";

import { styles } from "./button.stylex.ts";

interface ButtonTooltipProps {
  text: string;
  tooltip: ReturnType<typeof createButtonTooltip>;
}

export function ButtonTooltip(props: ButtonTooltipProps) {
  return (
    <span
      {...stylex.attrs(styles.tooltip)}
      ref={props.tooltip.setElement}
      id={props.tooltip.id}
      role="tooltip"
      popover="manual"
      hidden={!props.tooltip.visible()}
      style={{
        "position-anchor": props.tooltip.anchorName,
        "position-area": "block-start center",
      }}
      onPointerEnter={props.tooltip.cancelHide}
      onPointerLeave={props.tooltip.scheduleHide}
      textContent={props.text}
    />
  );
}
