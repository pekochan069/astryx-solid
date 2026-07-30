import type { JSX } from "@solidjs/web";

import { createContext, useContext } from "solid-js";

const LayerProviderContext = createContext(true);

export interface LayerProviderProps {
  children?: JSX.Element;
}

/** Ownership boundary for Layer descendants. Nested providers share document ownership. */
export function LayerProvider(props: LayerProviderProps) {
  return (
    <LayerProviderContext value={useContext(LayerProviderContext)}>
      {props.children}
    </LayerProviderContext>
  );
}
