import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { EmptyState } from "../../../src/components/empty-state/empty-state";

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

describe("EmptyState", () => {
  it("renders title and status semantics", () => {
    const container = mount(() => <EmptyState title="No results" />);
    const root = container.firstElementChild;

    expect(root?.getAttribute("role")).toBe("status");
    expect(root?.querySelector("h3")?.textContent).toBe("No results");
  });

  it("renders every heading level", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const container = mount(() => <EmptyState title={`Level ${level}`} headingLevel={level} />);
      expect(container.querySelector(`h${level}`)?.textContent).toBe(`Level ${level}`);
      dispose?.();
      document.body.replaceChildren();
    }
  });

  it("renders optional icon, description, and actions", () => {
    const container = mount(() => (
      <EmptyState
        icon={<span data-testid="icon">📭</span>}
        title="No messages"
        description="You are all caught up."
        actions={<button type="button">Compose</button>}
      />
    ));

    expect(container.querySelector('[aria-hidden="true"] [data-testid="icon"]')).not.toBeNull();
    expect(container.textContent).toContain("You are all caught up.");
    expect(container.querySelector("button")?.textContent).toBe("Compose");
  });

  it("forwards DOM props, classes, styles, and refs", () => {
    let ref: HTMLDivElement | undefined;
    const container = mount(() => (
      <EmptyState
        ref={(element) => (ref = element)}
        title="No results"
        data-testid="empty-state"
        class="consumer-class"
        style={{ color: "red" }}
      />
    ));
    const root = container.firstElementChild as HTMLDivElement;

    expect(ref).toBe(root);
    expect(root.getAttribute("data-testid")).toBe("empty-state");
    expect(root.className).toContain("consumer-class");
    expect(root.style.color).toBe("red");
  });

  it("applies compact theme variant and omits absent slots", () => {
    const container = mount(() => <EmptyState title="Empty" isCompact />);
    const root = container.firstElementChild as HTMLDivElement;

    expect(root.getAttribute("data-variant")).toBe("compact");
    expect(root.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(root.querySelector("button")).toBeNull();
  });
});
