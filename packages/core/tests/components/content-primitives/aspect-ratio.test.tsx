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
});
