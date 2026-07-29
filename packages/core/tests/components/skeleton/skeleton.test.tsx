import { render } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Skeleton } from "../../../src/components/skeleton/skeleton";

let dispose: VoidFunction | undefined;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("Skeleton", () => {
  it("renders dimensions and staggered animation delay", () => {
    const container = document.createElement("div");
    document.body.append(container);
    dispose = render(
      () => <Skeleton width={200} height="2rem" index={2} data-testid="skeleton" />,
      container,
    );
    const element = container.querySelector<HTMLDivElement>("[data-testid=skeleton]");

    expect(element).not.toBeNull();
    if (element === null) throw new Error("Expected Skeleton element");
    expect(element.getAttribute("aria-hidden")).toBe("true");
    expect(element.style.width).toBe("200px");
    expect(element.style.height).toBe("2rem");
    expect(element.style.animationDelay).toBe("1200ms");
  });

  it("hides placeholder from assistive technology by default and forwards props", () => {
    const container = document.createElement("div");
    document.body.append(container);
    dispose = render(
      () => (
        <Skeleton
          width={20}
          height={10}
          aria-hidden={false}
          class="consumer-class"
          data-testid="skeleton"
        />
      ),
      container,
    );
    const element = container.querySelector("[data-testid=skeleton]")!;

    expect(element.getAttribute("aria-hidden")).toBe("false");
    expect(element.className).toContain("astryx-solid-skeleton");
    expect(element.className).toContain("consumer-class");
  });
});
