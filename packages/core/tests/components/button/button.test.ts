import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createComponent } from "solid-js";

import { Button } from "../../../src/components/button/button";

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

describe("Button", () => {
  it("renders label and safe defaults", () => {
    const container = mount(() => createComponent(Button, { label: "Save" }));
    const button = container.querySelector("button")!;

    expect(button.textContent).toBe("Save");
    expect(button.type).toBe("button");
    expect(button.disabled).toBe(false);
    expect(button.className).toContain("astryx-solid-button");
    expect(button.getAttribute("data-variant")).toBe("secondary");
  });

  it("calls onClick unless disabled", () => {
    const onClick = mock();
    const container = mount(() => createComponent(Button, { label: "Save", onClick }));
    const button = container.querySelector("button")!;

    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    dispose?.();
    dispose = render(
      () => createComponent(Button, { label: "Save", isDisabled: true, onClick }),
      container,
    );
    container.querySelector("button")!.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes loading state and disables non-interruptible actions", () => {
    const container = mount(() => createComponent(Button, { label: "Saving", isLoading: true }));
    const button = container.querySelector("button")!;

    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(true);
  });

  it("keeps tooltip-disabled buttons focusable", () => {
    const container = mount(() =>
      createComponent(Button, { label: "Unavailable", tooltip: "Try later", isDisabled: true }),
    );
    const button = container.querySelector("button")!;

    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.title).toBe("Try later");
  });

  it("uses label as accessible name for icon-only buttons", () => {
    const container = mount(() =>
      createComponent(Button, { label: "Add item", icon: "+", isIconOnly: true }),
    );
    const button = container.querySelector("button")!;

    expect(button.getAttribute("aria-label")).toBe("Add item");
    expect(button.textContent).toBe("+");
  });
});
