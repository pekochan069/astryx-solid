import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";

import { Center } from "../../../src/components/center/center";

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

describe("Center", () => {
  it("centers both axes by default and reflects axis", () => {
    const container = mount(() => <Center data-testid="center">Content</Center>);
    const center = container.firstElementChild as HTMLElement;

    expect(center.textContent).toBe("Content");
    expect(center.className).toContain("astryx-solid-center");
    expect(center.getAttribute("data-axis")).toBe("both");
  });

  it("uses both axes when axis is explicitly undefined", () => {
    const container = mount(() => <Center axis={undefined} />);
    const center = container.firstElementChild;

    expect(center?.getAttribute("data-axis")).toBe("both");
  });

  it("supports axis modes, inline display, and sizing", () => {
    const container = mount(() => (
      <>
        <Center axis="horizontal">Horizontal</Center>
        <Center axis="vertical" isInline width={320} height="50vh" maxWidth="100%" minHeight={200}>
          Vertical
        </Center>
      </>
    ));
    const [horizontal, vertical] = Array.from(container.children) as HTMLElement[];

    expect(horizontal.className).not.toBe(vertical.className);
    expect(horizontal.getAttribute("data-axis")).toBe("horizontal");
    expect(vertical.getAttribute("data-axis")).toBe("vertical");
    expect(vertical.style.width).toBe("320px");
    expect(vertical.style.height).toBe("50vh");
    expect(vertical.style.maxWidth).toBe("100%");
    expect(vertical.style.minHeight).toBe("200px");
  });

  it("forwards DOM props, consumer styles, and ref", () => {
    const ref = mock();
    const container = mount(() => (
      <Center
        ref={ref}
        class="consumer-class"
        style={{ color: "red" }}
        aria-label="Centered content"
      >
        Content
      </Center>
    ));
    const center = container.firstElementChild as HTMLElement;

    expect(center.getAttribute("aria-label")).toBe("Centered content");
    expect(center.className).toContain("consumer-class");
    expect(center.style.color).toBe("red");
    expect(ref).toHaveBeenCalledWith(center);
  });
});
