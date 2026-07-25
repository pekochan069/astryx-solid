import type { Accessor } from "solid-js";

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

/** Return an accessor for nearest interaction-role override, if one exists. */
export function useInteractiveRoleContext(): Accessor<InteractiveRole | undefined> {
  const context = useContext(InteractiveRoleContext);
  return () => context?.role;
}
