import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createComponent } from "solid-js";

import { VisuallyHidden } from "../../../src/components/visually-hidden/visually-hidden";

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

describe("VisuallyHidden", () => {
  it("renders hidden content in a div by default", () => {
    const container = mount(() =>
      createComponent(VisuallyHidden, { children: "Screen reader text" }),
    );
    const element = container.firstElementChild!;

    expect(element.tagName).toBe("DIV");
    expect(element.textContent).toBe("Screen reader text");
    expect(element.className).not.toBe("");
  });

  it("supports polymorphic elements and forwards attributes", () => {
    const container = mount(() =>
      createComponent(VisuallyHidden, {
        as: "span",
        id: "description",
        "aria-live": "polite",
        children: "Updated",
      }),
    );
    const element = container.firstElementChild!;

    expect(element.tagName).toBe("SPAN");
    expect(element.id).toBe("description");
    expect(element.getAttribute("aria-live")).toBe("polite");
  });

  it("forwards refs", () => {
    const ref = mock();
    const container = mount(() => createComponent(VisuallyHidden, { ref, children: "Hidden" }));
    const element = container.firstElementChild!;

    expect(ref).toHaveBeenCalledWith(element);
  });
});
