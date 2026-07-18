import type { StyleXStyles } from "@stylexjs/stylex";

import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createComponent, createSignal } from "solid-js";

import { Stack } from "../../../src/components/stack/stack";

const customStyles = {
  backgroundColor: "test-consumer-style",
  $$css: true,
} as unknown as StyleXStyles;

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

describe("Stack", () => {
  it("renders children vertically by default", () => {
    const container = mount(() => createComponent(Stack, { children: ["First", "Second"] }));
    const stack = container.firstElementChild!;

    expect(stack.tagName).toBe("DIV");
    expect(stack.getAttribute("data-direction")).toBe("vertical");
    expect(stack.textContent).toBe("FirstSecond");
  });

  it("supports polymorphic elements and forwards DOM props and refs", () => {
    const ref = mock();
    const container = mount(() =>
      createComponent(Stack, {
        as: "nav",
        "aria-label": "Primary",
        "data-testid": "stack",
        ref,
        children: "Navigation",
      }),
    );
    const stack = container.firstElementChild!;

    expect(stack.tagName).toBe("NAV");
    expect(stack.getAttribute("aria-label")).toBe("Primary");
    expect(stack.getAttribute("data-testid")).toBe("stack");
    expect(ref).toHaveBeenCalledWith(stack);
  });

  it("converts numeric sizes to pixels and preserves CSS strings", () => {
    const container = mount(() =>
      createComponent(Stack, { width: 320, height: "50vh", maxWidth: "100%", minHeight: 200 }),
    );
    const stack = container.firstElementChild as HTMLElement;

    expect(stack.style.width).toBe("320px");
    expect(stack.style.height).toBe("50vh");
    expect(stack.style.maxWidth).toBe("100%");
    expect(stack.style.minHeight).toBe("200px");
  });

  it("reflects visual props and applies consumer styles", () => {
    const container = mount(() =>
      createComponent(Stack, {
        direction: "horizontal",
        gap: 4,
        wrap: "wrap",
        padding: 2,
        isScrollable: true,
        xstyle: customStyles,
      }),
    );
    const stack = container.firstElementChild!;
    expect(stack.getAttribute("data-direction")).toBe("horizontal");
    expect(stack.getAttribute("data-gap")).toBe("4");
    expect(stack.getAttribute("data-wrap")).toBe("wrap");
    expect(stack.className).toContain("test-consumer-style");
  });

  it("adds scroll styling when requested", () => {
    const container = mount(() => [
      createComponent(Stack, {}),
      createComponent(Stack, { isScrollable: true }),
    ]);
    const [plain, scrollable] = Array.from(container.children);

    expect(scrollable.className).not.toBe(plain.className);
  });

  it("reacts when direction changes", async () => {
    const [direction, setDirection] = createSignal<"horizontal" | "vertical">("vertical");
    const container = mount(() =>
      createComponent(Stack, {
        get direction() {
          return direction();
        },
      }),
    );
    const stack = container.firstElementChild!;

    expect(stack.getAttribute("data-direction")).toBe("vertical");
    setDirection("horizontal");
    await Promise.resolve();
    expect(stack.getAttribute("data-direction")).toBe("horizontal");
  });
});
