import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createComponent, createSignal } from "solid-js";

import { Button } from "../../../src/components/button/button";
import { SizeContext } from "../../../src/size-context";

let dispose: VoidFunction | undefined;

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

function buttonIn(container: Element) {
  const button = container.querySelector("button");
  expect(button).not.toBeNull();
  if (button === null) throw new Error("Button was not rendered");
  return button;
}

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("Button", () => {
  it("renders label and safe defaults", () => {
    const container = mount(() => createComponent(Button, { label: "Save" }));
    const button = buttonIn(container);

    expect(button.textContent).toBe("Save");
    expect(button.type).toBe("button");
    expect(button.disabled).toBe(false);
    expect(button.className).toContain("astryx-solid-button");
    expect(button.getAttribute("data-variant")).toBe("secondary");
  });

  it("calls onClick unless disabled", () => {
    const onClick = mock();
    const container = mount(() => createComponent(Button, { label: "Save", onClick }));
    const button = buttonIn(container);

    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    dispose?.();
    dispose = render(
      () => createComponent(Button, { label: "Save", isDisabled: true, onClick }),
      container,
    );
    buttonIn(container).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes loading state and disables non-interruptible actions", () => {
    const container = mount(() => createComponent(Button, { label: "Saving", isLoading: true }));
    const button = buttonIn(container);

    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(true);
  });

  it("prevents tooltip-disabled activation before consumer handlers", () => {
    const onClick = mock();
    const container = mount(() =>
      createComponent(Button, {
        label: "Unavailable",
        tooltip: "Try later",
        isDisabled: true,
        onClick,
      }),
    );
    const button = buttonIn(container);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });

    button.dispatchEvent(event);

    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    button.focus();
    const description = document.getElementById(button.getAttribute("aria-describedby") ?? "");
    expect(description?.role).toBe("tooltip");
    expect(description?.textContent).toBe("Try later");
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("inherits reactive size from its context", async () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    const container = mount(() =>
      createComponent(SizeContext, {
        value: {
          get size() {
            return size();
          },
        },
        get children() {
          return createComponent(Button, { label: "Save" });
        },
      }),
    );
    const button = container.querySelector("button");

    expect(button?.getAttribute("data-size")).toBe("sm");

    setSize("lg");
    await Promise.resolve();

    expect(button?.getAttribute("data-size")).toBe("lg");
  });

  it("forwards assignable refs", () => {
    const ref = mock();
    const container = mount(() => createComponent(Button, { label: "Save", ref }));
    const button = buttonIn(container);

    expect(ref).toHaveBeenCalledWith(button);
  });

  it("uses label as accessible name for icon-only buttons", () => {
    const container = mount(() =>
      createComponent(Button, { label: "Add item", icon: "+", isIconOnly: true }),
    );
    const button = buttonIn(container);

    expect(button.getAttribute("aria-label")).toBe("Add item");
    expect(button.textContent).toBe("+");
  });
});
