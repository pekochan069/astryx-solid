import type { JSX } from "@solidjs/web";

export function setElementRef<T extends HTMLElement>(ref: JSX.Ref<T> | undefined, element: T) {
  if (typeof ref === "function") {
    ref(element);
    return;
  }

  if (Array.isArray(ref)) {
    for (const nestedRef of ref) {
      setElementRef(nestedRef, element);
    }
  }
}
