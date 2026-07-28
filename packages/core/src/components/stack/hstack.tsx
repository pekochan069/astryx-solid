import { createComponent, merge } from "solid-js";

import type { StackProps } from "./stack";

import { Stack } from "./stack";

export type HStackProps = Omit<StackProps, "direction">;

/** Horizontal Stack shortcut. */
export function HStack(props: HStackProps) {
  return createComponent(Stack, merge(props, { direction: "horizontal" as const }));
}
