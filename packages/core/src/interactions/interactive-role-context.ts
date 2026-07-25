import { createContext, useContext } from "solid-js";

import type { InteractiveRole } from "./interactive-role";

/** Reactive role value supplied by an interaction owner. */
export interface InteractiveRoleContextValue {
  readonly role: InteractiveRole;
}

/** Optional role override for components that can render inert, as links, or as buttons. */
export const InteractiveRoleContext = createContext<InteractiveRoleContextValue | undefined>(
  undefined,
);

/** Return the nearest interaction-role override, if one exists. */
export function useInteractiveRoleContext(): InteractiveRole | undefined {
  return useContext(InteractiveRoleContext)?.role;
}
