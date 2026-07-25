import type { JSX } from "@solidjs/web";

import { createEffect, createSignal, onCleanup } from "solid-js";

export function setElementRef<T extends HTMLElement>(ref: JSX.Ref<T> | undefined, element: T) {
  if (typeof ref === "function") ref(element);
  else if (Array.isArray(ref)) {
    for (const nestedRef of ref) setElementRef(nestedRef, element);
  }
}

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

export function useTruncation(maxLines: () => number) {
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
  const ref = (next: HTMLElement) => {
    element = next;
    observe(maxLines());
  };

  createEffect(maxLines, observe);
  onCleanup(() => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  });

  return { ref, isTruncated: truncated, fullText: () => element?.textContent ?? "" };
}
