import type { JSX } from "@solidjs/web";
import type { Accessor, Component } from "solid-js";

import { createContext } from "solid-js";

/** Explicit adapter for routers whose link component accepts `href`. */
export type LinkComponent = Component<JSX.AnchorHTMLAttributes<HTMLAnchorElement>> | "a";

export const LinkContext = createContext<Accessor<LinkComponent>>(() => "a");

export interface LinkProviderProps {
  component: LinkComponent;
  children: JSX.Element;
}

/** Sets link root for descendants. Per-instance `as` takes precedence. */
export function LinkProvider(props: LinkProviderProps) {
  return <LinkContext value={() => props.component}>{props.children}</LinkContext>;
}
