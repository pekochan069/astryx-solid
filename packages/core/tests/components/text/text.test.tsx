import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Text } from "../../../src/components/text";

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

describe("Text", () => {
  it("renders polymorphic roots with theme metadata", () => {
    const container = mount(() => (
      <Text as="p" type="supporting" size="sm" color="secondary">
        Supporting copy
      </Text>
    ));
    const text = container.querySelector("p");

    expect(text?.textContent).toBe("Supporting copy");
    expect(text?.className).toContain("astryx-solid-text");
    expect(text?.getAttribute("data-type")).toBe("supporting");
    expect(text?.getAttribute("data-size")).toBe("sm");
    expect(text?.getAttribute("data-color")).toBe("secondary");
  });

  it("inherits color and preserves consumer titles", () => {
    const container = mount(() => (
      <Text type="inherit" maxLines={1} title="Consumer title">
        Inherited
      </Text>
    ));
    const text = container.querySelector("span");

    expect(text?.getAttribute("data-color")).toBe("inherit");
    expect(text?.title).toBe("Consumer title");
  });

  it("applies capsize and wrap styles without leaking component props", () => {
    const container = mount(() => (
      <>
        <Text>Default</Text>
        <Text hasCapsize>Capsize</Text>
        <Text textWrap="wrap">Wrapped</Text>
      </>
    ));
    const [defaultText, capsizeText, wrappedText] = container.querySelectorAll("span");

    expect(capsizeText?.className).not.toBe(defaultText?.className);
    expect(wrappedText?.className).not.toBe(defaultText?.className);
    expect(capsizeText?.hasAttribute("hascapsize")).toBe(false);
    expect(wrappedText?.hasAttribute("textwrap")).toBe(false);
  });
});
