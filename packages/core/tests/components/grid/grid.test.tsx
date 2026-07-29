import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Grid, GridSpan } from "../../../src/components/grid";

let dispose: VoidFunction | undefined;

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

function templateColumns(element: HTMLElement) {
  return element.style.getPropertyValue("--x-gridTemplateColumns");
}

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("Grid", () => {
  it("supports fixed and responsive column configurations", () => {
    const container = mount(() => (
      <>
        <Grid columns={3} data-testid="fixed" />
        <Grid columns={{ minWidth: 240, max: 3 }} gap={4} data-testid="responsive" />
      </>
    ));

    expect(templateColumns(container.querySelector("[data-testid=fixed]") as HTMLElement)).toBe(
      "repeat(3, 1fr)",
    );
    expect(
      templateColumns(container.querySelector("[data-testid=responsive]") as HTMLElement),
    ).toBe(
      "repeat(auto-fill, minmax(min(100%, max(240px, calc((100% - 2 * var(--spacing-4)) / 3))), 1fr))",
    );
  });

  it("keeps dynamic template out of raw inline CSS", () => {
    const container = mount(() => <Grid columns={2} data-testid="grid" />);
    const grid = container.querySelector("[data-testid=grid]") as HTMLElement;

    expect(grid.style.gridTemplateColumns).toBe("");
    expect(templateColumns(grid)).toBe("repeat(2, 1fr)");
  });

  it("supports dimensions, DOM props, and children", () => {
    const container = mount(() => (
      <Grid columns={2} width={600} height="50vh" data-testid="grid" aria-label="Products">
        <span>Item</span>
      </Grid>
    ));
    const grid = container.querySelector("[data-testid=grid]") as HTMLElement;

    expect(grid.getAttribute("aria-label")).toBe("Products");
    expect(grid.style.width).toBe("600px");
    expect(grid.style.height).toBe("50vh");
    expect(grid.textContent).toBe("Item");
  });
});

describe("GridSpan", () => {
  it("spans columns and rows, including full width", () => {
    const container = mount(() => (
      <Grid columns={3}>
        <GridSpan columns="full" rows={2} data-testid="span">
          Item
        </GridSpan>
      </Grid>
    ));
    const span = container.querySelector("[data-testid=span]") as HTMLElement;

    expect(span.style.gridColumn).toBe("1 / -1");
    expect(span.style.gridRow).toBe("span 2");
    expect(span.className).toContain("astryx-solid-grid-span");
    expect(span.textContent).toBe("Item");
  });
});
