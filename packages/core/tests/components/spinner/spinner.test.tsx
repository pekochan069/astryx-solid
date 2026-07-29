import { render } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Spinner } from "../../../src/components/spinner/spinner";

let dispose: VoidFunction | undefined;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("Spinner", () => {
  it("renders accessible status with canvas and theme metadata", () => {
    const container = document.createElement("div");
    document.body.append(container);
    dispose = render(() => <Spinner data-testid="spinner" />, container);

    const spinner = container.querySelector<HTMLElement>("[data-testid=spinner]");
    const canvas = spinner?.querySelector("canvas");

    expect(spinner?.tagName).toBe("SPAN");
    expect(spinner?.getAttribute("role")).toBe("status");
    expect(spinner?.getAttribute("aria-label")).toBe("Loading");
    expect(spinner?.getAttribute("data-size")).toBe("md");
    expect(spinner?.getAttribute("data-shade")).toBe("default");
    expect(spinner?.style.width).toBe("20px");
    expect(spinner?.style.height).toBe("20px");
    expect(canvas).not.toBeNull();
  });

  it("uses source dimensions for each size", () => {
    const container = document.createElement("div");
    document.body.append(container);
    dispose = render(
      () => (
        <>
          <Spinner size="sm" data-testid="sm" />
          <Spinner size="lg" data-testid="lg" />
          <Spinner size="xl" data-testid="xl" />
        </>
      ),
      container,
    );

    expect(container.querySelector<HTMLElement>("[data-testid=sm]")?.style.width).toBe("14px");
    expect(container.querySelector<HTMLElement>("[data-testid=lg]")?.style.width).toBe("24px");
    expect(container.querySelector<HTMLElement>("[data-testid=xl]")?.style.width).toBe("36px");
  });

  it("renders labeled spinner with string accessible name", () => {
    const container = document.createElement("div");
    document.body.append(container);
    dispose = render(
      () => <Spinner label="Fetching data" aria-label="Please wait" data-testid="spinner" />,
      container,
    );

    const root = container.querySelector<HTMLElement>("[data-testid=spinner]");
    const status = root?.querySelector('[role="status"]');

    expect(root?.tagName).toBe("DIV");
    expect(status?.getAttribute("aria-label")).toBe("Please wait");
    expect(root?.textContent).toContain("Fetching data");
  });
});
