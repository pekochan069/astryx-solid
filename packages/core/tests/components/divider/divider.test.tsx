import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createSignal } from "solid-js";

import { Divider } from "../../../src/components/divider/divider";

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

describe("Divider", () => {
  it("renders horizontal separator by default", () => {
    const container = mount(() => <Divider data-testid="divider" />);
    const divider = container.querySelector('[data-testid="divider"]');

    expect(divider?.getAttribute("role")).toBe("separator");
    expect(divider?.getAttribute("aria-orientation")).toBe("horizontal");
    expect(divider?.children).toHaveLength(1);
    expect(divider?.getAttribute("data-orientation")).toBe("horizontal");
    expect(divider?.getAttribute("data-variant")).toBe("subtle");
  });

  it("renders labelled vertical strong separators", () => {
    const container = mount(() => (
      <Divider orientation="vertical" variant="strong" label="Section" data-testid="divider" />
    ));
    const divider = container.querySelector('[data-testid="divider"]');

    expect(divider?.getAttribute("aria-orientation")).toBe("vertical");
    expect(divider?.className).toContain("vertical");
    expect(divider?.className).toContain("strong");
    expect(divider?.children).toHaveLength(3);
    expect(divider?.textContent).toBe("Section");
  });

  it("reacts to orientation, variant, and label changes", async () => {
    const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");
    const [variant, setVariant] = createSignal<"subtle" | "strong">("subtle");
    const [label, setLabel] = createSignal<JSX.Element>();
    const container = mount(() => (
      <Divider
        orientation={orientation()}
        variant={variant()}
        label={label()}
        data-testid="divider"
      />
    ));
    const divider = container.querySelector('[data-testid="divider"]')!;

    expect(divider.children).toHaveLength(1);

    setOrientation("vertical");
    setVariant("strong");
    setLabel("Updated");
    await Promise.resolve();

    expect(divider.getAttribute("aria-orientation")).toBe("vertical");
    expect(divider.className).toContain("vertical");
    expect(divider.className).toContain("strong");
    expect(divider.children).toHaveLength(3);
    expect(divider.textContent).toBe("Updated");
  });

  it("forwards DOM props, class, style, and ref", () => {
    let ref: HTMLDivElement | undefined;
    const container = mount(() => (
      <Divider
        ref={(element) => (ref = element)}
        class="consumer-class"
        style={{ color: "red" }}
        aria-label="Content separator"
        isFullBleed
      />
    ));
    const divider = container.querySelector<HTMLDivElement>("[role=separator]");

    if (divider === null || ref === undefined) throw new Error("Expected Divider root and ref");

    expect(ref).toBe(divider);
    expect(divider.getAttribute("aria-label")).toBe("Content separator");
    expect(divider.className).toContain("consumer-class");
    expect(divider.getAttribute("style")).toContain("color: red");
  });
});
