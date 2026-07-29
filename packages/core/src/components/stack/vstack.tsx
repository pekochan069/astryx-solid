import { createComponent, merge } from "solid-js";

import type { StackProps } from "./stack";
import type { StackCrossAlignment, StackMainAlignment } from "./stack.stylex";

import { Stack } from "./stack";

export interface VStackProps extends Omit<StackProps, "direction" | "hAlign" | "vAlign"> {
  hAlign?: StackCrossAlignment;
  vAlign?: StackMainAlignment;
}

/** Vertical Stack shortcut. */
export function VStack(props: VStackProps) {
  return createComponent(Stack, merge(props, { direction: "vertical" as const }));
}
