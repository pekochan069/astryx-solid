import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Heading } from "../../../src/components/heading";

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

describe("Heading", () => {
  it("renders semantic heading levels", () => {
    const container = mount(() => (
      <>
        <Heading level={1}>One</Heading>
        <Heading level={3}>Three</Heading>
        <Heading level={6}>Six</Heading>
      </>
    ));

    expect(container.querySelector("h1")?.textContent).toBe("One");
    expect(container.querySelector("h3")?.textContent).toBe("Three");
    expect(container.querySelector("h6")?.textContent).toBe("Six");
  });

  it("applies theme metadata and accessibility level", () => {
    const container = mount(() => (
      <Heading level={2} accessibilityLevel={3} color="secondary" type="display-2">
        Section
      </Heading>
    ));
    const heading = container.querySelector("h2");

    expect(heading?.className).toContain("astryx-solid-heading");
    expect(heading?.className).toContain("level-2");
    expect(heading?.className).toContain("secondary");
    expect(heading?.className).toContain("display-2");
    expect(heading?.getAttribute("data-level")).toBe("2");
    expect(heading?.getAttribute("data-accessibility-level")).toBeNull();
    expect(heading?.getAttribute("aria-level")).toBe("3");
  });

  it("forwards DOM props, ref, and inline styles", () => {
    let ref: HTMLHeadingElement | undefined;
    const container = mount(() => (
      <Heading
        level={1}
        ref={(element) => (ref = element)}
        id="title"
        data-testid="heading"
        style={{ color: "red" }}
        hasCapsize
        hasTruncateTooltip="above"
      >
        Title
      </Heading>
    ));
    const heading = container.querySelector<HTMLHeadingElement>("h1");

    if (heading === null || ref === undefined) throw new Error("Expected heading ref");

    expect(heading).toBe(ref);
    expect(heading?.id).toBe("title");
    expect(heading?.getAttribute("data-testid")).toBe("heading");
    expect(heading?.style.color).toBe("red");
    expect(heading?.hasAttribute("hascapsize")).toBe(false);
    expect(heading?.hasAttribute("hastruncatetooltip")).toBe(false);
  });

  it("supports truncation and text presentation props", () => {
    const container = mount(() => (
      <Heading
        level={2}
        maxLines={2}
        wordBreak="break-all"
        textWrap="balance"
        justify="center"
        hasStrikethrough
      >
        A long heading
      </Heading>
    ));
    const heading = container.querySelector("h2");

    expect(heading?.textContent).toBe("A long heading");
    expect(heading?.style.getPropertyValue("-webkit-line-clamp")).toBe("2");
  });
});
