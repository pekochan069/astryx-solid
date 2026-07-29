import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createComponent, createSignal } from "solid-js";

import type { ResizableRegion } from "../../src";

import {
  Center,
  FormLayout,
  Grid,
  GridSpan,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  Section,
  Stack,
  StackItem,
  useResizable,
} from "../../src";

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

describe("layout primitives", () => {
  it("renders grid, form, and centered content with semantic DOM props", () => {
    const container = mount(() => (
      <>
        <Center data-testid="center">Centered</Center>
        <Grid aria-label="Grid" columns={2}>
          <GridSpan columns={2}>Wide</GridSpan>
        </Grid>
        <FormLayout direction="horizontal-labels">
          <label for="name">Name</label>
          <input id="name" />
        </FormLayout>
      </>
    ));

    expect(container.querySelector('[data-testid="center"]')?.textContent).toBe("Centered");

    const grid = container.querySelector<HTMLElement>('[aria-label="Grid"]');

    expect(grid?.textContent).toBe("Wide");
    expect(grid?.style.getPropertyValue("--x-gridTemplateColumns")).toBe("repeat(2, 1fr)");
    expect(container.querySelector("label")?.htmlFor).toBe("name");
  });

  it("preserves Section edge compensation and Layout bar shells", () => {
    const container = mount(() => [
      createComponent(Section, {
        children: createComponent(Layout, {
          contentWidth: 640,
          header: createComponent(LayoutHeader, {
            children: <span data-testid="header-content">Header</span>,
          }),
          start: createComponent(LayoutPanel, { children: "Panel" }),
          children: createComponent(LayoutContent, { children: "Content" }),
          footer: createComponent(LayoutFooter, {
            children: <span data-testid="footer-content">Footer</span>,
          }),
        }),
      }),
      createComponent(Section, { padding: 0 }),
    ]);
    const [section] = Array.from(container.children);
    const headerContent = container.querySelector('[data-testid="header-content"]');
    const footerContent = container.querySelector('[data-testid="footer-content"]');

    expect(section.textContent).toBe("HeaderPanelContentFooter");
    expect(section.className).toContain("astryx-solid-section");
    expect(section.getAttribute("data-variant")).toBe("section");
    expect(headerContent?.parentElement?.className).not.toContain("astryx-solid-layout-header");
    expect(headerContent?.parentElement?.parentElement?.className).toContain(
      "astryx-solid-layout-header",
    );
    expect(footerContent?.parentElement?.className).not.toContain("astryx-solid-layout-footer");
    expect(footerContent?.parentElement?.parentElement?.className).toContain(
      "astryx-solid-layout-footer",
    );
  });

  it("reacts when optional Layout slots change", async () => {
    const [hasHeader, setHasHeader] = createSignal(false);
    const container = mount(() =>
      createComponent(Layout, {
        get header() {
          return hasHeader() ? createComponent(LayoutHeader, { children: "Header" }) : undefined;
        },
        children: createComponent(LayoutContent, { label: "Main", children: "Content" }),
      }),
    );

    expect(container.textContent).toBe("Content");
    expect(container.querySelector('[aria-label="Main"]')?.getAttribute("role")).toBe("region");

    setHasHeader(true);
    await Promise.resolve();
    expect(container.textContent).toBe("HeaderContent");

    setHasHeader(false);
    await Promise.resolve();
    expect(container.textContent).toBe("Content");
  });
});

describe("layout primitive variants", () => {
  it("renders responsive grids and ignores invalid spans", () => {
    const container = mount(() => (
      <>
        <Grid responsive={{ minColumnWidth: 240, maxColumns: 3 }} gap={2}>
          <GridSpan columns={0} rows={-1} data-testid="span">
            Item
          </GridSpan>
        </Grid>
        <Grid columns={0} rowHeight={-1} data-testid="fallback-grid" />
      </>
    ));
    const grid = container.firstElementChild;
    const span = container.querySelector<HTMLElement>('[data-testid="span"]');
    const fallback = container.querySelector<HTMLElement>('[data-testid="fallback-grid"]');

    if (!(grid instanceof HTMLElement)) throw new Error("Expected grid");
    if (span == null) throw new Error("Expected grid span");
    if (fallback == null) throw new Error("Expected fallback grid");

    expect(grid.style.getPropertyValue("--x-gridTemplateColumns")).toContain("repeat(auto-fit");
    expect(grid.style.getPropertyValue("--x-gridTemplateColumns")).toContain("240px");
    expect(span.style.gridColumn).toBe("");
    expect(span.style.gridRow).toBe("");
    expect(span.className).toContain("astryx-solid-grid-span");
    expect(fallback.style.getPropertyValue("--x-gridTemplateColumns")).toBe("1fr");
    expect(fallback.style.gridAutoRows).toBe("");
  });

  it("renders StackItem through Stack's public composition seam", () => {
    const container = mount(() => (
      <Stack>
        <StackItem size="fill">Item</StackItem>
      </Stack>
    ));

    expect(container.textContent).toBe("Item");
  });

  it("uses resizable panel size and preserves divider defaults", async () => {
    let sidebar!: ResizableRegion;
    const container = mount(() => {
      sidebar = useResizable({ defaultSize: 240 });

      return (
        <Layout
          defaultHasDividers
          start={
            <LayoutPanel width={120} resizable={sidebar.props}>
              Panel
            </LayoutPanel>
          }
          header={<LayoutHeader>Header</LayoutHeader>}
          content={<LayoutContent>Content</LayoutContent>}
        />
      );
    });

    const panel = container.querySelector<HTMLElement>(".astryx-solid-layout-panel");
    const header = container.querySelector<HTMLElement>(".astryx-solid-layout-header");

    expect(panel?.style.width).toBe("240px");
    expect(header?.hasAttribute("data-divider")).toBe(true);

    sidebar?.resize(300);
    await Promise.resolve();
    expect(panel?.style.width).toBe("300px");
  });
});
