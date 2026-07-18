import { createContext, useContext } from "solid-js";

/** Standard sizes used by interactive Astryx components. */
export type ElementSize = "sm" | "md" | "lg";

/**
 * Context for cascading a default component size through a Solid subtree.
 * `null` means no ancestor provides a size.
 */
export const SizeContext = createContext<ElementSize | null>(null);

/**
 * Resolves size in priority order: explicit prop, inherited context, fallback.
 *
 * @param sizeProp - Explicit component size. Always wins when provided.
 * @param defaultSize - Fallback when neither prop nor context supplies a size.
 * @returns Resolved size.
 *
 * @example
 * ```tsx
 * const size = useSize(props.size, "md");
 * ```
 */
export function useSize<T extends string = ElementSize>(sizeProp?: T, defaultSize: T = "md" as T) {
  const inherited = useContext(SizeContext);
  return sizeProp ?? (inherited as T | null) ?? defaultSize;
}

/**
 * Solid context component used to provide an inherited element size.
 *
 * @example
 * ```tsx
 * <SizeContextProvider value="sm">
 *   <Button label="Compact" />
 * </SizeContextProvider>
 * ```
 */
export const SizeContextProvider = SizeContext;
