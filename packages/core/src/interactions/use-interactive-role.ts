import type { Accessor } from "solid-js";

import { createMemo } from "solid-js";

import type { InteractiveRole } from "./interactive-role";

import { useInteractiveRoleContext } from "./interactive-role-context";

export interface UseInteractiveRoleOptions {
  href?: string;
  onClick?: ((...args: never[]) => unknown) | null;
  isDisabled?: boolean;
}

/** Resolve an optionally interactive component's role from reactive props and context. */
export function useInteractiveRole(options: UseInteractiveRoleOptions): Accessor<InteractiveRole> {
  const readContextRole = useInteractiveRoleContext();

  return createMemo(() => {
    if (options.href != null && !options.isDisabled) return "link";
    if (options.onClick != null) return "button";

    return readContextRole() ?? "inert";
  });
}
