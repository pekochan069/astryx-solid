import { createComponent, merge } from "solid-js";

import type { StackProps } from "./stack";

import { Stack } from "./stack";

export type VStackProps = Omit<StackProps, "direction">;

/** Vertical Stack shortcut. */
export function VStack(props: VStackProps) {
  return createComponent(Stack, merge(props, { direction: "vertical" as const }));
}
