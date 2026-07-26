import type { JSX } from "@solidjs/web";

import { createEffect, createSignal, onCleanup } from "solid-js";

import { setElementRef } from "../../utils/set-element-ref";

function multiLineIsTruncated(element: HTMLElement) {
  try {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().height > element.offsetHeight;
  } catch {
    return element.scrollHeight > element.offsetHeight;
  }
}

function isTruncated(element: HTMLElement, maxLines: number) {
  return maxLines === 1 ? element.scrollWidth > element.offsetWidth : multiLineIsTruncated(element);
}

interface TruncationOptions<T extends HTMLElement> {
  maxLines: () => number | undefined;
  wordBreak: () => "break-word" | "break-all" | undefined;
  ref?: JSX.Ref<T>;
}

export function useTruncation<T extends HTMLElement>(options: TruncationOptions<T>) {
  const maxLines = () => options.maxLines() ?? 0;
  const wordBreak = () => options.wordBreak() ?? (maxLines() === 1 ? "break-all" : "break-word");
  const [truncated, setTruncated] = createSignal(false);
  let element: HTMLElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;

  const check = (lines: number) => {
    setTruncated(Boolean(element && lines > 0 && isTruncated(element, lines)));
  };
  const measure = () => check(maxLines());
  const observe = (lines: number) => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    resizeObserver = undefined;
    mutationObserver = undefined;
    check(lines);

    if (!element || lines <= 0) return;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(element);
    }
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(measure);
      mutationObserver.observe(element, { childList: true, characterData: true, subtree: true });
    }
  };
  const ref = (next: T) => {
    element = next;
    setElementRef(options.ref, next);
    observe(maxLines());
  };

  createEffect(maxLines, observe);
  onCleanup(() => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  });

  return {
    ref,
    maxLines,
    wordBreak,
    isTruncated: truncated,
    fullText: () => element?.textContent ?? "",
  };
}
