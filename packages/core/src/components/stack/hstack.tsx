import { createComponent, merge } from "solid-js";

import type { StackProps } from "./stack";
import type { StackCrossAlignment, StackMainAlignment } from "./stack.stylex";

import { Stack } from "./stack";

export interface HStackProps extends Omit<StackProps, "direction" | "hAlign" | "vAlign"> {
  hAlign?: StackMainAlignment;
  vAlign?: StackCrossAlignment;
}

/** Horizontal Stack shortcut. */
export function HStack(props: HStackProps) {
  return createComponent(Stack, merge(props, { direction: "horizontal" as const }));
}
