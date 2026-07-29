import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Thumbnail } from "../../../src/components/thumbnail";

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

describe("Thumbnail", () => {
  it("renders image, placeholder, and loading states", () => {
    const image = mount(() => <Thumbnail src="/photo.jpg" alt="Photo" label="photo.jpg" />);
    expect(image.querySelector("img")?.getAttribute("alt")).toBe("Photo");
    expect(image.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe(
      "photo.jpg — Photo",
    );

    dispose?.();
    const skeleton = mount(() => <Thumbnail isLoading label="photo.jpg" />);
    expect(skeleton.querySelector("img")).toBeNull();
    expect(skeleton.querySelector(".astryx-solid-skeleton")).not.toBeNull();

    dispose?.();
    const placeholder = mount(() => <Thumbnail label="photo.jpg" />);
    expect(placeholder.querySelector("svg")).not.toBeNull();
  });

  it("uses decorative image semantics when alt is absent", () => {
    const container = mount(() => <Thumbnail src="/photo.jpg" label="photo.jpg" />);
    const image = container.querySelector("img");

    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.getAttribute("role")).toBe("presentation");
    expect(image?.getAttribute("aria-hidden")).toBe("true");
  });

  it("supports open and remove actions while honoring disabled state", () => {
    let opened = 0;
    let removed = 0;
    const container = mount(() => (
      <Thumbnail
        src="/photo.jpg"
        alt="Photo"
        label="photo.jpg"
        onClick={() => opened++}
        onRemove={() => removed++}
      />
    ));

    const buttons = container.querySelectorAll("button");
    buttons[0]?.click();
    buttons[1]?.click();
    expect(opened).toBe(1);
    expect(removed).toBe(1);

    dispose?.();
    const disabled = mount(() => (
      <Thumbnail label="photo.jpg" onClick={() => opened++} onRemove={() => removed++} isDisabled />
    ));
    expect(disabled.querySelectorAll("button").length).toBe(0);
  });

  it("keeps hover remove behavior mounted and distinguishes always mode", () => {
    const hover = mount(() => <Thumbnail label="photo.jpg" onRemove={() => {}} />);
    const hoverSlot = hover.querySelector("button")?.parentElement;
    expect(hoverSlot).not.toBeNull();

    dispose?.();
    const always = mount(() => (
      <Thumbnail label="photo.jpg" onRemove={() => {}} showRemoveOn="always" />
    ));
    const alwaysSlot = always.querySelector("button")?.parentElement;
    expect(alwaysSlot?.className).not.toBe(hoverSlot?.className);
  });
});
