import type { JSX } from "@solidjs/web";

import type { Locale, MessagesByLocale, Overrides } from "./types";

import { InternationalizationContext } from "./internationalization-context";

export interface InternationalizationProviderProps {
  locale: Locale;
  messages?: MessagesByLocale;
  overrides?: Overrides;
  children?: JSX.Element;
}

/** Provide locale catalogs and sparse consumer overrides to descendants. */
export function InternationalizationProvider(props: InternationalizationProviderProps) {
  const value = {
    get locale() {
      return props.locale;
    },
    get messages() {
      return props.messages ?? {};
    },
    get overrides() {
      return props.overrides;
    },
  };

  return <InternationalizationContext value={value}>{props.children}</InternationalizationContext>;
}
