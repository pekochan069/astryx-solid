import { createComponent } from "solid-js";

import type { StackProps } from "./stack";
import type { StackCrossAlignment, StackMainAlignment } from "./stack.stylex";

import { Stack } from "./stack";

export interface HStackProps extends Omit<StackProps, "direction" | "hAlign" | "vAlign"> {
  hAlign?: StackMainAlignment;
  vAlign?: StackCrossAlignment;
  justify?: StackMainAlignment;
  align?: StackCrossAlignment;
}

/** Horizontal Stack shortcut. Explicit axis props override aliases. */
export function HStack(props: HStackProps) {
  return createComponent(Stack, {
    ...props,
    direction: "horizontal",
    get hAlign() {
      return props.hAlign ?? props.justify;
    },
    get vAlign() {
      return props.vAlign ?? props.align;
    },
  });
}
