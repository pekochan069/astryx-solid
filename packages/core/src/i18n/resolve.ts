import type { Catalog, Locale, MessagesByLocale, Overrides } from "./types";

import enCatalog from "../../locales/en.json" with { type: "json" };

const fallbackCatalog = enCatalog as Catalog;

/** Return most-specific to least-specific BCP 47 locale tags. */
export function resolveLocaleChain(locale: Locale): Locale[] {
  let canonical = locale;
  try {
    canonical = new Intl.Locale(locale).baseName;
  } catch {
    // Keep malformed input usable; lookup still falls back to English.
  }
  const parts = canonical.split("-").filter(Boolean);
  return parts.map((_, index) => parts.slice(0, parts.length - index).join("-"));
}

function lookup(
  key: string,
  locale: Locale,
  messages: MessagesByLocale,
  overrides?: Overrides,
): string | undefined {
  for (const tag of resolveLocaleChain(locale)) {
    const override = overrides?.[tag]?.[key];
    if (override !== undefined) return override;
  }
  for (const tag of resolveLocaleChain(locale)) {
    const message = messages[tag]?.[key];
    if (message) return message.defaultMessage;
  }
  return fallbackCatalog[key]?.defaultMessage;
}

function matchingBrace(message: string, start: number): number {
  let depth = 0;
  for (let index = start; index < message.length; index++) {
    if (message[index] === "{") depth++;
    if (message[index] === "}" && --depth === 0) return index;
  }
  return -1;
}

function splitArgument(argument: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  for (let index = 0; index < argument.length; index++) {
    if (argument[index] === "{") depth++;
    else if (argument[index] === "}") depth--;
    else if (argument[index] === "," && depth === 0) {
      parts.push(argument.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(argument.slice(start).trim());
  return parts;
}

function selectOption(body: string, selector: string, exact?: string): string {
  const options = new Map<string, string>();
  const pattern = /(=?[\w-]+)\s*\{/g;
  for (let match = pattern.exec(body); match; match = pattern.exec(body)) {
    const end = matchingBrace(body, pattern.lastIndex - 1);
    if (end < 0) break;
    options.set(match[1], body.slice(pattern.lastIndex, end));
    pattern.lastIndex = end + 1;
  }
  return (
    options.get(`=${exact}`) ??
    options.get(`=${selector}`) ??
    options.get(selector) ??
    options.get("other") ??
    ""
  );
}

function formatArgument(argument: string, values: Record<string, unknown>, locale: Locale): string {
  const parts = splitArgument(argument);
  const value = values[parts[0]];
  if (parts[1] === "number") return new Intl.NumberFormat(locale).format(Number(value));
  if (parts[1] === "date" || parts[1] === "time") {
    const formatter = new Intl.DateTimeFormat(
      locale,
      parts[1] === "time" ? { timeStyle: "short" } : { dateStyle: "medium" },
    );
    return formatter.format(value instanceof Date ? value : new Date(Number(value)));
  }
  if (parts[1] !== "plural" && parts[1] !== "selectordinal" && parts[1] !== "select") {
    if (value == null) return `{${argument}}`;
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      ? `${value}`
      : JSON.stringify(value);
  }
  const selected =
    parts[1] === "select"
      ? String(value)
      : new Intl.PluralRules(locale, {
          type: parts[1] === "selectordinal" ? "ordinal" : "cardinal",
        }).select(Number(value));
  return formatMessage(
    selectOption(parts.slice(2).join(","), selected, String(value)).replaceAll("#", String(value)),
    values,
    locale,
  );
}

function formatMessage(message: string, values: Record<string, unknown>, locale: Locale): string {
  let result = "";
  for (let index = 0; index < message.length; index++) {
    if (message[index] !== "{") {
      result += message[index];
      continue;
    }
    const end = matchingBrace(message, index);
    if (end < 0) return message;
    result += formatArgument(message.slice(index + 1, end), values, locale);
    index = end;
  }
  return result;
}

const warned = new Set<string>();

/** Resolve and format one message from locale catalogs and overrides. */
export function resolve(
  key: string,
  values: Record<string, unknown> | undefined,
  locale: Locale,
  messages: MessagesByLocale,
  overrides?: Overrides,
): string {
  const message = lookup(key, locale, messages, overrides);
  if (message === undefined) {
    if (!warned.has(key)) {
      warned.add(key);
      console.warn(`[astryx-i18n] missing key: ${key}`);
    }
    return key;
  }
  return values ? formatMessage(message, values, locale) : message;
}

export function __resetForTests() {
  warned.clear();
}
