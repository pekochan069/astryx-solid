import type { Accessor } from "solid-js";

import { createMemo, useContext } from "solid-js";

import { LinkContext, type LinkComponent } from "./link-provider.tsx";

/** Resolve local adapter, nearest provider, then native anchor. No `to` injection. */
export function useLinkComponent(
  as?: Accessor<LinkComponent | undefined>,
): Accessor<LinkComponent> {
  const provided = useContext(LinkContext);
  return createMemo(() => as?.() ?? provided());
}
