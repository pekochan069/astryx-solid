import type { JSX } from "@solidjs/web";

import { createMemo } from "solid-js";

import type { Locale, MessagesByLocale, Overrides } from "./types";

import { InternationalizationContext } from "./InternationalizationContext";

export interface InternationalizationProviderProps {
  locale: Locale;
  messages?: MessagesByLocale;
  overrides?: Overrides;
  children?: JSX.Element;
}

/** Provide locale catalogs and sparse consumer overrides to descendants. */
export function InternationalizationProvider(props: InternationalizationProviderProps) {
  const value = createMemo(() => ({
    locale: props.locale,
    messages: props.messages ?? {},
    overrides: props.overrides,
  }));
  return (
    <InternationalizationContext value={value()}>{props.children}</InternationalizationContext>
  );
}
