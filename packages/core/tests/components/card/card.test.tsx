import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Card } from "../../../src/components/card/card";

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

describe("Card", () => {
  it("renders children and theme attributes", () => {
    const container = mount(() => <Card variant="muted">Content</Card>);
    const card = container.firstElementChild;

    expect(card?.textContent).toBe("Content");
    expect(card?.className).toContain("astryx-solid-card");
    expect(card?.getAttribute("data-variant")).toBe("muted");
  });

  it("applies sizing, DOM props, class, style, and ref", () => {
    let ref: HTMLDivElement | undefined;
    const container = mount(() => (
      <Card
        ref={(element) => (ref = element)}
        width={320}
        height="50vh"
        maxWidth="100%"
        minHeight={200}
        class="consumer-class"
        style={{ color: "red" }}
        aria-label="Card"
      >
        Content
      </Card>
    ));
    const card = container.firstElementChild as HTMLDivElement;

    expect(ref).toBe(card);
    expect(card.getAttribute("aria-label")).toBe("Card");
    expect(card.className).toContain("consumer-class");
    expect(card.style.width).toBe("320px");
    expect(card.style.height).toBe("50vh");
    expect(card.style.maxWidth).toBe("100%");
    expect(card.style.minHeight).toBe("200px");
    expect(card.style.color).toBe("red");
  });

  it("uses distinct classes for elevation levels and scrolls fixed heights", () => {
    const container = mount(() => (
      <>
        <Card elevation="none">None</Card>
        <Card elevation="low">Low</Card>
        <Card elevation="med">Med</Card>
        <Card elevation="high" height={100}>
          High
        </Card>
      </>
    ));
    const cards = Array.from(container.children);

    expect(new Set(cards.map((card) => card.className)).size).toBe(4);
    expect(cards[3]?.className).not.toBe(cards[0]?.className);
  });
});
