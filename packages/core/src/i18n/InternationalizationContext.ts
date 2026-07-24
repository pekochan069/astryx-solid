import { createContext } from "solid-js";

import type { Locale, MessagesByLocale, Overrides } from "./types";

export interface InternationalizationContextValue {
  locale: Locale;
  messages: MessagesByLocale;
  overrides?: Overrides;
}

export const InternationalizationContext = createContext<InternationalizationContextValue>({
  locale: "en",
  messages: {},
});
