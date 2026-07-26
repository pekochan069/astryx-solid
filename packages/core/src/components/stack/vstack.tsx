import { createComponent, merge } from "solid-js";

import type { StackProps } from "./stack";
import type { StackCrossAlignment, StackMainAlignment } from "./stack.stylex";

import { Stack } from "./stack";

export interface VStackProps extends Omit<StackProps, "direction" | "hAlign" | "vAlign"> {
  hAlign?: StackCrossAlignment;
  vAlign?: StackMainAlignment;
  justify?: StackMainAlignment;
  align?: StackCrossAlignment;
}

/** Vertical Stack shortcut. Explicit axis props override aliases. */
export function VStack(props: VStackProps) {
  const stackProps = {
    direction: "vertical",
    get hAlign() {
      return props.hAlign ?? props.align;
    },
    get vAlign() {
      return props.vAlign ?? props.justify;
    },
  } satisfies Pick<StackProps, "direction" | "hAlign" | "vAlign">;

  return createComponent(Stack, merge(props, stackProps));
}
