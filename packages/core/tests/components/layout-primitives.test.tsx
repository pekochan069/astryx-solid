import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createComponent } from "solid-js";

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
    expect(grid?.style.gridTemplateColumns).toBe("repeat(2, 1fr)");
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
          content: createComponent(LayoutContent, { children: "Content" }),
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
    expect(headerContent?.parentElement?.className).not.toContain("astryx-solid-layout-header");
    expect(headerContent?.parentElement?.parentElement?.className).toContain(
      "astryx-solid-layout-header",
    );
    expect(footerContent?.parentElement?.className).not.toContain("astryx-solid-layout-footer");
    expect(footerContent?.parentElement?.parentElement?.className).toContain(
      "astryx-solid-layout-footer",
    );
  });

  it("renders StackItem through Stack's public composition seam", () => {
    const container = mount(() => (
      <Stack>
        <StackItem size="fill">Item</StackItem>
      </Stack>
    ));

    expect(container.textContent).toBe("Item");
  });
});
