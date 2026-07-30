import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Overlay } from "../../../src/components/overlay";

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

describe("Overlay", () => {
  it("keeps base media before scrim and controlled closed content inert", () => {
    const container = mount(() => (
      <Overlay isOpen={false} content={<button>action</button>}>
        <img alt="media" />
      </Overlay>
    ));
    expect(container.querySelector("img")).toBeTruthy();
    expect(container.querySelector("button")?.closest("div")?.getAttribute("inert")).toBe("");
  });

  it("renders always-visible scrim without ownership side effects", () => {
    const container = mount(() => <Overlay content={<span>content</span>} />);
    expect(container.textContent).toContain("content");
    expect(document.body.style.overflow).toBe("");
  });
});
