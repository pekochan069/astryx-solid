import { createContext, useContext } from "solid-js";

export type ElementSize = "sm" | "md" | "lg";

export const SizeContext = createContext<ElementSize | null>(null);

export function useSize<T extends string = ElementSize>(sizeProp?: T, defaultSize: T = "md" as T) {
  const inherited = useContext(SizeContext);
  return sizeProp ?? (inherited as T | null) ?? defaultSize;
}

export const SizeContextProvider = SizeContext;
