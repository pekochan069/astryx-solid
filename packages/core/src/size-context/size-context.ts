import type { Accessor } from "solid-js";

import { createContext, createMemo, useContext } from "solid-js";

/** Standard sizes used by interactive Astryx components. */
export type ElementSize = "sm" | "md" | "lg";

/** Reactive size value supplied by a layout or interaction owner. */
export interface SizeContextValue {
  readonly size: ElementSize | null;
}

/**
 * Context for cascading a default component size through a Solid subtree.
 * `null` means no ancestor provides a size.
 */
export const SizeContext = createContext<SizeContextValue>({ size: null });

/** Resolve size in priority order: explicit prop, inherited context, fallback. */
export function useSize(
  sizeProp?: Accessor<ElementSize | undefined>,
  defaultSize: ElementSize = "md",
): Accessor<ElementSize> {
  const context = useContext(SizeContext);

  return createMemo(() => sizeProp?.() ?? context.size ?? defaultSize);
}
