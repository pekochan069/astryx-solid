import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import {
  getIcon,
  getIconRegistry,
  Icon,
  registerIcons,
  resetIcons,
} from "../../../src/components/icon/icon";

let dispose: VoidFunction | undefined;

function TestIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return <svg {...props} />;
}

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

afterEach(() => {
  dispose?.();
  dispose = undefined;
  resetIcons();
  document.body.replaceChildren();
});

describe("Icon", () => {
  it("renders direct SVG icons with rem sizing and decorative accessibility", () => {
    const container = mount(() => <Icon icon={TestIcon} size="lg" data-testid="icon" />);
    const icon = container.querySelector('[data-testid="icon"]')!;

    expect(icon.tagName.toLowerCase()).toBe("svg");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.className).toContain("lg");
  });

  it("uses label as accessible name and lets explicit ARIA props win", () => {
    const container = mount(() => (
      <Icon
        icon={TestIcon}
        label="Close"
        aria-label="Dismiss"
        aria-hidden="true"
        data-testid="icon"
      />
    ));
    const icon = container.querySelector('[data-testid="icon"]')!;

    expect(icon.getAttribute("role")).toBe("img");
    expect(icon.getAttribute("aria-label")).toBe("Dismiss");
    expect(icon.hasAttribute("aria-hidden")).toBe(true);
  });

  it("wraps semantic icons and keeps SVG-only props off wrapper", () => {
    registerIcons({ close: <svg data-testid="registered" /> });
    const container = mount(() => (
      <Icon icon="close" data-testid="icon" viewBox="0 0 24 24" label="Close" />
    ));
    const wrapper = container.querySelector('[data-testid="icon"]')!;

    expect(wrapper.tagName.toLowerCase()).toBe("span");
    expect(wrapper.getAttribute("role")).toBe("img");
    expect(wrapper.getAttribute("aria-label")).toBe("Close");
    expect(wrapper.hasAttribute("viewBox")).toBe(false);
    expect(wrapper.querySelector('[data-testid="registered"]')).not.toBeNull();
  });

  it("keeps registry snapshots aligned with fallback lookup", () => {
    registerIcons({ close: null });

    expect(getIcon("close")).toBeDefined();
    expect(getIconRegistry().close).toBe(getIcon("close"));
  });
});
