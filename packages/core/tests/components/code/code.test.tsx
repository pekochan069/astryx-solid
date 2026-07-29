import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createSignal } from "solid-js";

import { Code, type CodeColor, type CodeSize } from "../../../src/components/code/code";

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

describe("Code", () => {
  it("renders children and default theme", () => {
    const container = mount(() => <Code>const value = 1</Code>);
    const code = container.querySelector("code");

    expect(code?.textContent).toBe("const value = 1");
    expect(code?.getAttribute("data-color")).toBe("primary");
    expect(code?.className).toContain("astryx-solid-code");
    expect(code?.className).toContain("primary");
  });

  it("reacts to color and inherit size styles", async () => {
    const [color, setColor] = createSignal<CodeColor>("secondary");
    const [size, setSize] = createSignal<CodeSize>();
    const container = mount(() => (
      <Code color={color()} size={size()}>
        code
      </Code>
    ));
    const code = container.querySelector("code")!;
    const defaultClass = code.className;

    setSize("inherit");
    await Promise.resolve();

    expect(code.className).toContain("secondary");
    expect(code.className).not.toBe(defaultClass);

    setColor("inherit");
    await Promise.resolve();

    expect(code.className).toContain("inherit");
    expect(code.className).not.toContain(" secondary");
  });

  it("forwards DOM props, ref, class, and style", () => {
    let ref: HTMLElement | undefined;
    const container = mount(() => (
      <Code
        ref={(element) => (ref = element)}
        class="consumer-class"
        style={{ color: "red" }}
        aria-label="Inline code"
      >
        code
      </Code>
    ));
    const code = container.querySelector("code");

    if (code === null || ref === undefined) throw new Error("Expected Code root and ref");

    expect(ref).toBe(code);
    expect(code.getAttribute("aria-label")).toBe("Inline code");
    expect(code.className).toContain("consumer-class");
    expect(code.style.color).toBe("red");
  });
});
