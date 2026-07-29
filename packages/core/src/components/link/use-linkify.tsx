import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

import { createMemo } from "solid-js";

import { Link } from "./link.tsx";

export interface LinkifyPattern {
  pattern: RegExp;
  href: (match: RegExpMatchArray) => string;
  label?: (match: RegExpMatchArray) => string;
  isExternal?: boolean;
}
export interface UseLinkifyOptions {
  patterns?: Accessor<readonly LinkifyPattern[] | undefined>;
  hasBuiltins?: Accessor<boolean | undefined>;
}

const builtins: readonly LinkifyPattern[] = [
  { pattern: /https?:\/\/[^\s<>'")\]},]+/g, href: (match) => match[0], isExternal: true },
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    href: (match) => `mailto:${match[0]}`,
  },
];

function matches(text: string, patterns: readonly LinkifyPattern[]) {
  const found: {
    start: number;
    end: number;
    href: string;
    label: string;
    isExternal: boolean;
    priority: number;
  }[] = [];
  patterns.forEach((entry, priority) => {
    if (!entry.pattern.global || entry.pattern.test(""))
      throw new Error("Linkify patterns must be global and cannot match empty text");
    const pattern = new RegExp(entry.pattern.source, entry.pattern.flags);
    for (let match = pattern.exec(text); match != null; match = pattern.exec(text)) {
      if (match[0].length === 0) throw new Error("Linkify patterns cannot match empty text");
      found.push({
        start: match.index,
        end: match.index + match[0].length,
        href: entry.href(match),
        label: entry.label?.(match) ?? match[0],
        isExternal: entry.isExternal ?? false,
        priority,
      });
    }
  });
  found.sort((left, right) => left.start - right.start || left.priority - right.priority);
  const accepted: typeof found = [];
  let lastEnd = 0;
  for (const match of found) {
    if (match.start < lastEnd) continue;
    accepted.push(match);
    lastEnd = match.end;
  }
  return accepted;
}

/** Reactive Solid replacement for React hook: pass text/options as accessors. */
export function useLinkify(
  text: Accessor<string>,
  options: UseLinkifyOptions = {},
): Accessor<JSX.Element[]> {
  return createMemo(() => {
    const value = text();
    const patterns = [
      ...(options.patterns?.() ?? []),
      ...(options.hasBuiltins?.() === false ? [] : builtins),
    ];
    let cursor = 0;
    const nodes: JSX.Element[] = [];
    for (const match of matches(value, patterns)) {
      if (cursor < match.start) nodes.push(value.slice(cursor, match.start));
      nodes.push(
        <Link href={match.href} isExternalLink={match.isExternal}>
          {match.label}
        </Link>,
      );
      cursor = match.end;
    }
    if (cursor < value.length || nodes.length === 0) nodes.push(value.slice(cursor));
    return nodes;
  });
}
