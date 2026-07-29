import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createSignal } from "solid-js";

import { Badge, type BadgeVariant } from "../../../src/components/badge/badge";

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

describe("Badge", () => {
  it("renders label, icon, and default theme", () => {
    const container = mount(() => <Badge icon={<span data-testid="icon">*</span>} label="Ready" />);
    const badge = container.querySelector("span");

    expect(badge?.textContent).toBe("*Ready");
    expect(badge?.getAttribute("data-variant")).toBe("neutral");
    expect(badge?.className).toContain("astryx-solid-badge");
  });

  it("updates variant styling from reactive props", async () => {
    const [variant, setVariant] = createSignal<BadgeVariant>("info");
    const container = mount(() => <Badge variant={variant()} label="Status" />);
    const badge = container.querySelector("span");

    expect(badge?.getAttribute("data-variant")).toBe("info");
    expect(badge?.className).toContain("info");

    setVariant("success");
    await Promise.resolve();

    expect(badge?.getAttribute("data-variant")).toBe("success");
    expect(badge?.className).toContain("success");
    expect(badge?.className).not.toContain(" info");
  });

  it("forwards DOM props, ref, class, and style", () => {
    let ref: HTMLSpanElement | undefined;
    const container = mount(() => (
      <Badge
        ref={(element) => (ref = element)}
        class="consumer-class"
        style={{ color: "red" }}
        aria-label="Status"
        label="Ready"
      />
    ));
    const badge = container.querySelector("span");
    if (badge === null || ref === undefined) throw new Error("Expected Badge root and ref");

    expect(ref).toBe(badge);
    expect(badge.getAttribute("aria-label")).toBe("Status");
    expect(badge.className).toContain("consumer-class");
    expect(badge.style.color).toBe("red");
  });
});
