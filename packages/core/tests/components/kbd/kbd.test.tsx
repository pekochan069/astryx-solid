import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Kbd } from "../../../src/components/kbd/kbd";

let dispose: VoidFunction | undefined;

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

const originalPlatform = navigator.platform;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: originalPlatform,
  });
  Reflect.deleteProperty(navigator, "userAgentData");
  document.body.replaceChildren();
});

describe("Kbd", () => {
  it("renders key symbols and spoken accessible name", () => {
    const container = mount(() => <Kbd keys="ctrl+shift+k" data-testid="shortcut" />);
    const shortcut = container.querySelector("[data-testid=shortcut]");

    expect(shortcut?.tagName).toBe("SPAN");
    expect(shortcut?.getAttribute("role")).toBe("img");
    expect(shortcut?.getAttribute("aria-label")).toBe("Control + Shift + K");
    expect(shortcut?.querySelector("kbd")?.textContent).toBe("⌃");
    expect(shortcut?.querySelectorAll('kbd[aria-hidden="true"]')).toHaveLength(3);
  });

  it("maps special and unknown keys", () => {
    const container = mount(() => <Kbd keys="enter+escape+f1+plus" />);
    const keys = [...container.querySelectorAll("kbd")].map((key) => key.textContent);

    expect(keys).toEqual(["↵", "Esc", "F1", "+"]);
  });

  it("renders mod for Mac platforms", () => {
    Object.defineProperty(navigator, "platform", { configurable: true, value: "MacIntel" });

    const container = mount(() => <Kbd keys="mod+k" />);

    expect(container.querySelector("kbd")?.textContent).toBe("⌘");
    expect(container.firstElementChild?.getAttribute("aria-label")).toBe("Command + K");
  });

  it("prefers User-Agent Client Hints platform", () => {
    Object.defineProperty(navigator, "platform", { configurable: true, value: "Linux" });
    Object.defineProperty(navigator, "userAgentData", {
      configurable: true,
      value: { platform: "macOS" },
    });

    const container = mount(() => <Kbd keys="mod" />);

    expect(container.querySelector("kbd")?.textContent).toBe("⌘");
  });

  it("forwards DOM props, class, and style", () => {
    const container = mount(() => (
      <Kbd keys="k" class="consumer-class" style={{ color: "red" }} aria-describedby="help" />
    ));
    const shortcut = container.querySelector("span");

    expect(shortcut?.className).toContain("astryx-solid-kbd");
    expect(shortcut?.className).toContain("consumer-class");
    expect(shortcut?.style.color).toBe("red");
    expect(shortcut?.getAttribute("aria-describedby")).toBe("help");
  });
});
