import { describe, expect, it } from "bun:test";

import { registerLayer } from "../../../src/components/layer/ownership/layer-stack";
import { lockScroll } from "../../../src/components/layer/ownership/scroll-lock";

function layer(document: Document, close: () => void, lightDismiss = true) {
  const host = document.createElement("div");
  document.body.append(host);
  return { host, close, lightDismiss };
}

describe("layer ownership", () => {
  it("dismisses only topmost eligible layer", () => {
    const document = globalThis.document.implementation.createHTMLDocument("test");
    let lower = 0;
    let upper = 0;
    const first = layer(document, () => lower++);
    const second = layer(document, () => upper++, false);
    const releaseFirst = registerLayer(document, first);
    const releaseSecond = registerLayer(document, second);

    const escape = new Event("keydown");
    Object.defineProperty(escape, "key", { value: "Escape" });
    document.dispatchEvent(escape);
    expect(lower).toBe(0);
    expect(upper).toBe(0);
    releaseSecond();
    const lowerEscape = new Event("keydown");
    Object.defineProperty(lowerEscape, "key", { value: "Escape" });
    document.dispatchEvent(lowerEscape);
    expect(lower).toBe(1);
    releaseFirst();
  });

  it("keeps scroll locked until final idempotent release", () => {
    const document = globalThis.document.implementation.createHTMLDocument("test");
    document.body.style.setProperty("overflow", "scroll", "important");
    const first = lockScroll(document);
    const second = lockScroll(document);
    first();
    expect(document.body.style.overflow).toBe("hidden");
    second();
    second();
    expect(document.body.style.overflow).toBe("scroll");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("important");
  });
});
