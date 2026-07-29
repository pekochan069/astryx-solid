import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createComponent } from "solid-js";

import { AspectRatio } from "../../../src/components/aspect-ratio/aspect-ratio";

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

describe("AspectRatio", () => {
  it("preserves ratio, shape, fit marker, and child", () => {
    const container = mount(() =>
      createComponent(AspectRatio, {
        ratio: 16 / 9,
        shape: "ellipse",
        fit: "cover",
        children: <img src="image.jpg" alt="Preview" />,
      }),
    );
    const element = container.querySelector("div")!;

    expect(element.getAttribute("data-shape")).toBe("ellipse");
    expect(element.style.aspectRatio).toContain(String(16 / 9));
    expect(element.firstElementChild?.getAttribute("data-astryx-solid-aspect-ratio-override")).toBe(
      "cover",
    );
    expect(element.querySelector("img")?.alt).toBe("Preview");
  });

  it("defaults to rectangle and leaves fit off theme surface", () => {
    const container = mount(() =>
      createComponent(AspectRatio, {
        ratio: 1,
        fit: "contain",
        "data-testid": "aspect-ratio",
        children: <div>Content</div>,
      }),
    );
    const element = container.querySelector('[data-testid="aspect-ratio"]')!;
    const wrapper = element.firstElementChild!;

    expect(element.getAttribute("data-shape")).toBe("rectangle");
    expect(element.getAttribute("data-fit")).toBeNull();
    expect(wrapper.getAttribute("data-astryx-solid-aspect-ratio-override")).toBe("contain");
  });

  it("forwards DOM props, refs, classes, and consumer styles", () => {
    let ref: HTMLDivElement | undefined;
    const container = mount(() =>
      createComponent(AspectRatio, {
        ratio: 4 / 3,
        ref: (element) => (ref = element),
        class: "consumer-class",
        style: { color: "red" },
        "aria-label": "Preview",
        children: "Content",
      }),
    );
    const element = container.querySelector("div")!;

    expect(ref).toBe(element);
    expect(element.getAttribute("aria-label")).toBe("Preview");
    expect(element.className).toContain("consumer-class");
    expect(element.style.color).toBe("red");
  });
});
