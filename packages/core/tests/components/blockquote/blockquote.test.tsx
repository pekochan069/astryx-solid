import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Blockquote } from "../../../src/components/blockquote/blockquote";

let dispose: VoidFunction | undefined;

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("Blockquote", () => {
  it("renders semantic content and theme class", () => {
    const container = mount(() => <Blockquote data-testid="quote">Quote</Blockquote>);
    const quote = container.querySelector("blockquote");

    expect(quote?.textContent).toBe("Quote");
    expect(quote?.className).toContain("astryx-solid-blockquote");
    expect(quote?.querySelector("footer")).toBeNull();
  });

  it("renders string and element citations", () => {
    const container = mount(() => (
      <>
        <Blockquote cite="Author">Quote</Blockquote>
        <Blockquote cite={<span data-testid="citation">Custom author</span>}>Quote</Blockquote>
      </>
    ));

    expect(container.querySelectorAll("footer")).toHaveLength(2);
    expect(container.querySelector("blockquote cite")?.textContent).toBe("Author");
    expect(container.querySelector('[data-testid="citation"]')?.textContent).toBe("Custom author");
  });

  it("forwards DOM props, styles, xstyle, and ref", () => {
    let ref: HTMLQuoteElement | undefined;
    const container = mount(() => (
      <Blockquote
        ref={(element) => (ref = element)}
        aria-label="Important quote"
        class="consumer-class"
        style={{ color: "red" }}
      >
        Quote
      </Blockquote>
    ));
    const quote = container.querySelector("blockquote");

    if (quote === null || ref === undefined) throw new Error("Expected blockquote ref");

    expect(ref).toBe(quote);
    expect(quote.getAttribute("aria-label")).toBe("Important quote");
    expect(quote.className).toContain("consumer-class");
    expect(quote.style.color).toBe("red");
  });
});
