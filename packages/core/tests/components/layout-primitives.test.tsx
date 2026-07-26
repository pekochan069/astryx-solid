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
    expect(container.querySelector('[aria-label="Grid"]')?.textContent).toBe("Wide");
    expect(container.querySelector("label")?.htmlFor).toBe("name");
  });

  it("uses default Section padding and composes all Layout regions", () => {
    const container = mount(() => [
      createComponent(Section, {
        children: createComponent(Layout, {
          header: createComponent(LayoutHeader, { children: "Header" }),
          start: createComponent(LayoutPanel, { children: "Panel" }),
          content: createComponent(LayoutContent, { children: "Content" }),
          footer: createComponent(LayoutFooter, { children: "Footer" }),
        }),
      }),
      createComponent(Section, { padding: 0 }),
    ]);
    const [section, unpaddedSection] = Array.from(container.children);

    expect(section.textContent).toBe("HeaderPanelContentFooter");
    expect(section.firstElementChild?.className).not.toBe(
      unpaddedSection.firstElementChild?.className,
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
