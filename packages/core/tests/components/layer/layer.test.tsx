import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { useLayer } from "../../../src/components/layer";
import { addAnchorName, removeAnchorName } from "../../../src/components/layer/anchor-name";

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

describe("Layer", () => {
  it("renders stable inline host and opens without Popover API", async () => {
    const container = mount(() => {
      const layer = useLayer({ mode: "context", lightDismiss: true });
      return (
        <>
          {layer.render(<span>content</span>)}
          <button ref={layer.ref} onClick={layer.show}>
            open
          </button>
        </>
      );
    });
    const button = container.querySelector("button")!;
    button.click();
    await Promise.resolve();
    const host = container.querySelector<HTMLElement>("[data-layer]")!;
    expect(host.textContent).toBe("content");
    expect(host.hidden).toBe(false);
  });

  it("allows idempotent hide before host attachment", () => {
    expect(() => {
      const container = mount(() => {
        const layer = useLayer({ mode: "fixed" });
        layer.show();
        layer.hide();
        return layer.render(<span>content</span>, { x: 0, y: 0 });
      });
      expect(container.textContent).toContain("content");
    }).not.toThrow();
  });

  it("restores consumer anchor names after cleanup", () => {
    const trigger = document.createElement("button");
    trigger.style.setProperty("anchor-name", "--consumer", "important");
    addAnchorName(trigger, "--owned");
    removeAnchorName(trigger, "--owned");
    expect(trigger.style.getPropertyValue("anchor-name")).toBe("--consumer");
    expect(trigger.style.getPropertyPriority("anchor-name")).toBe("important");
  });

  it("keeps trigger anchor names owned by sibling layers", () => {
    const container = mount(() => {
      const first = useLayer({ mode: "context" });
      const second = useLayer({ mode: "context" });
      return (
        <button
          ref={(element) => {
            first.ref(element);
            second.ref(element);
          }}
        >
          trigger
        </button>
      );
    });
    const anchor = container.querySelector("button")?.style.getPropertyValue("anchor-name");
    expect(anchor).toContain("--astryx-layer");
  });
});
