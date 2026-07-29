import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createSignal } from "solid-js";

import { Citation } from "../../../src/components/citation/citation";

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

describe("Citation", () => {
  it("renders label links and safe default link attributes", () => {
    const container = mount(() => (
      <Citation source={{ title: "Example", url: "https://example.com" }} number={1} />
    ));
    const citation = container.firstElementChild;

    expect(citation?.tagName).toBe("A");
    expect(citation?.textContent).toBe("Example");
    expect(citation?.getAttribute("role")).toBe("doc-noteref");
    expect(citation?.getAttribute("target")).toBe("_blank");
    expect(citation?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(citation?.getAttribute("aria-label")).toBe("Citation 1: Example");
    expect(citation?.className).toContain("astryx-solid-citation");
  });

  it("renders number variant and omits reference role without URL", () => {
    const container = mount(() => (
      <Citation source={{ title: "Unlinked" }} number={4} variant="number" />
    ));
    const citation = container.firstElementChild;

    expect(citation?.tagName).toBe("SPAN");
    expect(citation?.textContent).toBe("4");
    expect(citation?.getAttribute("role")).toBeNull();
    expect(citation?.getAttribute("title")).toBe("Unlinked");
  });

  it("supports source images and JSX icon nodes", () => {
    const imageContainer = mount(() => (
      <Citation source={{ title: "Image", src: "https://example.com/logo.png" }} number={1} />
    ));
    const image = imageContainer.querySelector("img");

    expect(image?.getAttribute("src")).toBe("https://example.com/logo.png");
    expect(image?.getAttribute("alt")).toBe("");
    expect(imageContainer.querySelector('[aria-hidden="true"] img')).toBe(image);

    dispose?.();
    document.body.replaceChildren();

    const legacyContainer = mount(() => (
      <Citation source={{ title: "Legacy", icon: "https://example.com/favicon.png" }} number={1} />
    ));

    expect(legacyContainer.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/favicon.png",
    );

    dispose?.();
    document.body.replaceChildren();

    const iconContainer = mount(() => (
      <Citation source={{ title: "Icon", icon: <svg data-testid="icon" /> }} number={2} />
    ));

    expect(iconContainer.querySelector("img")).toBeNull();
    expect(iconContainer.querySelector('[aria-hidden="true"] [data-testid="icon"]')).not.toBeNull();
  });

  it("reacts to URL, title, and variant changes and forwards refs", async () => {
    const [url, setUrl] = createSignal<string>();
    const [title, setTitle] = createSignal("First");
    const [variant, setVariant] = createSignal<"label" | "number">("label");
    const ref = mock();
    const container = mount(() => (
      <Citation source={{ title: title(), url: url() }} number={7} variant={variant()} ref={ref} />
    ));

    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(ref).toHaveBeenCalledWith(container.firstElementChild);

    setUrl("https://example.com");
    setTitle("Updated");
    setVariant("number");
    await Promise.resolve();

    expect(container.firstElementChild?.tagName).toBe("A");
    expect(container.firstElementChild?.textContent).toBe("7");
    expect(container.firstElementChild?.getAttribute("title")).toBe("Updated");
    expect(container.firstElementChild?.getAttribute("role")).toBe("doc-noteref");

    setUrl(undefined);
    await Promise.resolve();
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });
});
