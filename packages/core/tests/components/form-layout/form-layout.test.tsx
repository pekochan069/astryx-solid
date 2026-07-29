import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { useContext } from "solid-js";

import { FormLayout, FormLayoutContext } from "../../../src/components/form-layout";

let dispose: VoidFunction | undefined;

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

function DirectionReader() {
  const context = useContext(FormLayoutContext);
  return <span data-testid="direction" textContent={context.direction} />;
}

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("FormLayout", () => {
  it("renders children and forwards DOM props", () => {
    const container = mount(() => (
      <FormLayout data-testid="layout" id="form" role="group">
        <input data-testid="child" />
      </FormLayout>
    ));
    const layout = container.querySelector('[data-testid="layout"]') as HTMLDivElement;

    expect(layout.tagName).toBe("DIV");
    expect(layout.id).toBe("form");
    expect(layout.getAttribute("role")).toBe("group");
    expect(layout.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it.each([
    [undefined, "vertical"],
    ["horizontal", "horizontal"],
    ["horizontal-labels", "horizontal-labels"],
  ] as const)("provides %s direction context", (direction, expected) => {
    const container = mount(() => (
      <FormLayout {...(direction == null ? {} : { direction })}>
        <DirectionReader />
      </FormLayout>
    ));

    expect(container.querySelector('[data-testid="direction"]')?.textContent).toBe(expected);
    expect(container.firstElementChild?.getAttribute("data-direction")).toBe(expected);
    expect(container.firstElementChild?.className).toContain("astryx-solid-form-layout");
  });

  it("supports nested layouts with independent directions", () => {
    const container = mount(() => (
      <FormLayout direction="vertical">
        <DirectionReader />
        <FormLayout direction="horizontal">
          <DirectionReader />
        </FormLayout>
      </FormLayout>
    ));

    expect(
      Array.from(container.querySelectorAll('[data-testid="direction"]')).map(
        (element) => element.textContent,
      ),
    ).toEqual(["vertical", "horizontal"]);
  });

  it("forwards ref and merges consumer presentation props", () => {
    let ref: HTMLDivElement | undefined;
    const container = mount(() => (
      <FormLayout
        ref={(element) => (ref = element)}
        class="consumer-class"
        style={{ color: "red" }}
      >
        Content
      </FormLayout>
    ));
    const layout = container.firstElementChild as HTMLDivElement;

    expect(ref).toBe(layout);
    expect(layout.className).toContain("consumer-class");
    expect(layout.style.color).toBe("red");
  });
});
