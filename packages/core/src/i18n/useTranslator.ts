import { createMemo, useContext } from "solid-js";

import { InternationalizationContext } from "./InternationalizationContext";
import { resolve } from "./resolve";

export type TranslatorFn = (key: string, values?: Record<string, unknown>) => string;

/** Return translator bound to the nearest locale provider. */
export function useTranslator(): TranslatorFn {
  const context = useContext(InternationalizationContext);
  const locale = createMemo(() => context.locale);
  return (key, values) => resolve(key, values, locale(), context.messages, context.overrides);
}
