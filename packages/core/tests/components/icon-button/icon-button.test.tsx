import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { IconButton } from "../../../src/components/icon-button";

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

describe("IconButton", () => {
  it("renders required icon with label as accessible name", () => {
    const container = mount(() => <IconButton label="Settings" icon="⚙" />);
    const button = container.querySelector("button")!;

    expect(button.getAttribute("aria-label")).toBe("Settings");
    expect(button.textContent).toContain("⚙");
    expect(button.textContent).not.toContain("Settings");
  });
});
