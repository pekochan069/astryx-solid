import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createSignal } from "solid-js";

import {
  Card,
  EmptyState,
  ProgressBar,
  ResizeHandle,
  type ResizableRegion,
  StatusDot,
  Thumbnail,
  Timestamp,
  useResizable,
} from "../../src";

let dispose: VoidFunction | undefined;

function mount(view: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  dispose = render(view, container);
  return container;
}

function dispatch(type: string, values: Record<string, string | number> = {}) {
  const event = new Event(type, { bubbles: true, cancelable: true });

  for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });

  return event;
}

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  window.localStorage.clear();
});

describe("container and status primitives", () => {
  it("renders card, empty state, status dot, thumbnail, and timestamp semantics", () => {
    const container = mount(() => (
      <>
        <Card variant="muted">Card content</Card>
        <EmptyState title="No results" description="Try another search" headingLevel={2} />
        <StatusDot variant="success" label="Online" isPulsing />
        <Thumbnail label="photo.png" onRemove={() => {}} />
        <Timestamp data-testid="timestamp" value="2026-03-25T10:00:00Z" format="system_date" />
      </>
    ));

    expect(container.textContent).toContain("Card content");
    expect(container.querySelector("h2")?.textContent).toBe("No results");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Try another search");
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Online");
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("photo.png");
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe(
      "2026-03-25T10:00:00.000Z",
    );
    expect(container.querySelector('[data-testid="timestamp"]')?.tagName).toBe("TIME");
  });

  it("clamps progress and exposes indeterminate progress without values", () => {
    const container = mount(() => (
      <>
        <ProgressBar value={150} max={100} label="Upload" hasValueLabel />
        <ProgressBar value={50} label="Default max" />
        <ProgressBar isIndeterminate label="Loading" />
      </>
    ));
    const [determinate, defaultMax, indeterminate] = Array.from(
      container.querySelectorAll('[role="progressbar"]'),
    );

    expect(determinate?.getAttribute("aria-valuenow")).toBe("100");
    expect(determinate?.getAttribute("aria-valuetext")).toBe("100%");
    expect(defaultMax?.getAttribute("aria-valuenow")).toBe("50");
    expect(defaultMax?.getAttribute("aria-valuemax")).toBe("100");
    expect(indeterminate?.hasAttribute("aria-valuenow")).toBe(false);
  });

  it("updates progress from reactive props", async () => {
    const [value, setValue] = createSignal(25);
    const container = mount(() => <ProgressBar value={value()} max={100} label="Upload" />);
    const progress = container.querySelector('[role="progressbar"]');

    expect(progress?.getAttribute("aria-valuenow")).toBe("25");
    setValue(75);
    await Promise.resolve();
    expect(progress?.getAttribute("aria-valuenow")).toBe("75");
  });

  it("renders loading thumbnails without an image", () => {
    const container = mount(() => <Thumbnail isLoading label="Upload" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".astryx-solid-skeleton")).not.toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it("restores collapsed region size and reports ownership changes", () => {
    let region: ResizableRegion | undefined;
    const changes: string[] = [];
    mount(() => {
      region = useResizable({
        defaultSize: 200,
        collapsible: true,
        onSizeChange: (size) => changes.push(`size:${size}`),
        onCollapseChange: (collapsed) => changes.push(`collapsed:${collapsed}`),
      });
      return null;
    });
    if (region === undefined) throw new Error("Expected resize region");

    region.collapse();
    region.expand();

    expect(region.size).toBe(200);
    expect(changes).toEqual(["collapsed:true", "size:0", "collapsed:false", "size:200"]);
  });

  it("persists named regions independently", async () => {
    let regions: Record<string, ResizableRegion> | undefined;
    mount(() => {
      regions = useResizable({
        autoSaveId: "workspace",
        regions: {
          sidebar: { defaultSize: 200 },
          inspector: { defaultSize: 300, collapsible: true },
        },
      });
      return null;
    });
    if (regions === undefined) throw new Error("Expected resize regions");

    regions.sidebar.resize(240);
    regions.inspector.collapse();

    expect(window.localStorage.getItem("astryx-resizable:workspace:sidebar")).toBe("240");
    expect(window.localStorage.getItem("astryx-resizable:workspace:inspector")).toBe("0");
  });

  it("restores persisted collapsed regions after mount", async () => {
    window.localStorage.setItem("astryx-resizable:sidebar", "0");
    let region: ResizableRegion | undefined;
    mount(() => {
      region = useResizable({ defaultSize: 200, collapsible: true, autoSaveId: "sidebar" });
      return null;
    });
    if (region === undefined) throw new Error("Expected resize region");

    await Promise.resolve();

    expect(region.isCollapsed).toBe(true);
    expect(region.size).toBe(0);
  });

  it("collapses from double-click and ignores disabled handles", async () => {
    let region: ResizableRegion | undefined;
    const container = mount(() => {
      region = useResizable({ defaultSize: 200, collapsible: true });
      return (
        <>
          <ResizeHandle label="Resize sidebar" resizable={region.props} />
          <ResizeHandle label="Disabled resize sidebar" resizable={region.props} isDisabled />
        </>
      );
    });
    if (region === undefined) throw new Error("Expected resize region");
    const [handle, disabled] = Array.from(
      container.querySelectorAll<HTMLElement>("[role=separator]"),
    );
    if (handle === undefined || disabled === undefined) throw new Error("Expected resize handles");

    handle.dispatchEvent(new Event("dblclick", { bubbles: true }));
    await Promise.resolve();

    expect(region.isCollapsed).toBe(true);

    disabled.dispatchEvent(new Event("dblclick", { bubbles: true }));
    await Promise.resolve();

    expect(region.isCollapsed).toBe(true);
  });

  it("keeps snapped sizes within region bounds", async () => {
    let region: ResizableRegion | undefined;
    mount(() => {
      region = useResizable({ defaultSize: 200, minSizePx: 100, maxSizePx: 300, snaps: [0, 200] });
      return null;
    });
    if (region === undefined) throw new Error("Expected resize region");

    region.resize(90);
    await Promise.resolve();

    expect(region.size).toBe(100);
  });

  it("resizes through the focusable separator keyboard seam", async () => {
    let handle: HTMLDivElement | undefined;
    const container = mount(() => {
      const region = useResizable({ defaultSize: 200, minSizePx: 100, maxSizePx: 400 });
      return (
        <ResizeHandle
          ref={(element) => (handle = element)}
          label="Resize sidebar"
          resizable={region.props}
        />
      );
    });
    const separator = container.querySelector<HTMLElement>('[role="separator"]');
    if (separator === null) throw new Error("Expected resize separator");

    const event = new Event("keydown", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "key", { value: "ArrowRight" });
    separator.dispatchEvent(event);
    await Promise.resolve();

    expect(handle?.isSameNode(separator)).toBe(true);
    expect(separator.getAttribute("aria-valuenow")).toBe("210");

    const home = new Event("keydown", { bubbles: true, cancelable: true });
    Object.defineProperty(home, "key", { value: "Home" });
    separator.dispatchEvent(home);
    await Promise.resolve();

    expect(home.defaultPrevented).toBe(true);
    expect(separator.getAttribute("aria-valuenow")).toBe("100");
  });

  it("reverses RTL resizing and stops canceled drags", async () => {
    let region: ResizableRegion | undefined;
    const container = mount(() => {
      region = useResizable({ defaultSize: 200, minSizePx: 100, maxSizePx: 400 });
      return (
        <ResizeHandle
          label="Resize sidebar"
          resizable={region.props}
          style={{ direction: "rtl" }}
        />
      );
    });
    if (region === undefined) throw new Error("Expected resize region");
    const separator = container.querySelector<HTMLElement>('[role="separator"]');
    if (separator === null) throw new Error("Expected resize separator");

    const right = dispatch("keydown", { key: "ArrowRight" });
    separator.dispatchEvent(right);
    await Promise.resolve();

    expect(region.size).toBe(190);

    separator.dispatchEvent(dispatch("pointerdown", { clientX: 0 }));
    window.dispatchEvent(dispatch("pointermove", { clientX: 25 }));
    await Promise.resolve();

    expect(region.size).toBe(165);

    window.dispatchEvent(dispatch("pointercancel"));
    window.dispatchEvent(dispatch("pointermove", { clientX: 50 }));
    await Promise.resolve();

    expect(region.size).toBe(165);
    expect(document.body.style.cursor).toBe("");
    expect(document.body.style.userSelect).toBe("");
  });
});
