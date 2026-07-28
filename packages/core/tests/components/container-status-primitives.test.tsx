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
    expect(container.textContent).toContain("Try another search");
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Online");
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("photo.png");
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe(
      "2026-03-25T10:00:00.000Z",
    );
    expect(container.querySelector('[data-testid="timestamp"]')?.tagName).toBe("TIME");
  });

  it("opens status dot tooltip on focus and closes on Escape", async () => {
    const container = mount(() => (
      <StatusDot variant="warning" label="Needs attention" tooltip="Service needs attention" />
    ));
    const dot = container.querySelector<HTMLElement>('[role="img"]');
    if (dot === null) throw new Error("Expected status dot");

    dot.focus();
    await Promise.resolve();
    const tooltip = container.querySelector('[role="tooltip"]');
    if (tooltip === null) throw new Error("Expected status dot tooltip");

    expect(dot.getAttribute("aria-describedby")).toBe(tooltip.id);
    expect(dot.hasAttribute("title")).toBe(false);

    dot.dispatchEvent(dispatch("keydown", { key: "Escape" }));
    await Promise.resolve();
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });
});

describe("progress bar", () => {
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

  it("styles disabled progress labels and values", () => {
    const container = mount(() => (
      <>
        <ProgressBar value={32} label="Active" hasValueLabel />
        <ProgressBar value={32} label="Disabled" hasValueLabel isDisabled />
      </>
    ));
    const activeLabel = Array.from(container.querySelectorAll("span")).find(
      (element) => element.textContent === "Active",
    );
    const disabledLabel = Array.from(container.querySelectorAll("span")).find(
      (element) => element.textContent === "Disabled",
    );
    const [activeValue, disabledValue] = Array.from(container.querySelectorAll("span")).filter(
      (element) => element.textContent === "32%",
    );
    const [, disabledProgress] = container.querySelectorAll('[role="progressbar"]');

    expect(disabledProgress?.getAttribute("aria-disabled")).toBe("true");
    expect(disabledLabel?.className).not.toBe(activeLabel?.className);
    expect(disabledValue?.className).not.toBe(activeValue?.className);
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
});

describe("empty state", () => {
  it("applies compact title, description, and action layout", () => {
    const container = mount(() => (
      <>
        <EmptyState
          title="Regular"
          description="Regular description"
          actions={<button>Go</button>}
        />
        <EmptyState
          title="Compact"
          description="Compact description"
          actions={<button>Go compact</button>}
          isCompact
        />
      </>
    ));
    const [regularTitle, compactTitle] = Array.from(container.querySelectorAll("h3"));
    const regularDescription = Array.from(container.querySelectorAll("div")).find(
      (element) => element.textContent === "Regular description",
    );
    const compactDescription = Array.from(container.querySelectorAll("div")).find(
      (element) => element.textContent === "Compact description",
    );

    expect(compactTitle?.className).not.toBe(regularTitle?.className);
    expect(compactDescription?.className).not.toBe(regularDescription?.className);
    expect(container.getElementsByTagName("button")[1]?.parentElement?.className).not.toBe(
      container.getElementsByTagName("button")[0]?.parentElement?.className,
    );
  });
});

describe("timestamp", () => {
  it("renders documented wording, formats, and text styles", () => {
    const container = mount(() => (
      <>
        <Timestamp
          data-testid="default-timestamp"
          value={Date.now() / 1000 - 100_000}
          format="relative"
          hasTooltip={false}
        />
        <Timestamp
          data-testid="past-timestamp"
          value={Date.now() / 1000 - 10}
          format="relative"
          hasTooltip={false}
        />
        <Timestamp
          data-testid="future-timestamp"
          value={Date.now() / 1000 + 20}
          format="relative"
          hasTooltip={false}
        />
        <Timestamp
          data-testid="styled-timestamp"
          value="2026-02-19T17:00:00Z"
          format="date_long"
          type="label"
          size="lg"
          color="accent"
          weight="bold"
        />
        <Timestamp value="2026-02-19T17:00:00Z" format="date_weekday" />
        <Timestamp
          data-testid="date-timezone"
          value="2026-02-19T17:00:00Z"
          format="date"
          isTimezoneShown
        />
        <Timestamp data-testid="system-time" value="2026-02-19T17:00:00Z" format="system_time" />
        <Timestamp
          data-testid="system-time-timezone"
          value="2026-02-19T17:00:00Z"
          format="system_time"
          isTimezoneShown
        />
      </>
    ));
    const defaultTimestamp = container.querySelector<HTMLElement>(
      '[data-testid="default-timestamp"]',
    );
    const styledTimestamp = container.querySelector<HTMLElement>(
      '[data-testid="styled-timestamp"]',
    );

    expect(defaultTimestamp?.textContent).toBe("yesterday");
    expect(container.querySelector('[data-testid="past-timestamp"]')?.textContent).toBe(
      "10 seconds ago",
    );
    expect(container.querySelector('[data-testid="future-timestamp"]')?.textContent).toBe("now");
    expect(styledTimestamp?.textContent).toContain("February");
    expect(styledTimestamp?.className).not.toBe(defaultTimestamp?.className);
    expect(container.textContent).toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    expect(container.querySelector('[data-testid="date-timezone"]')?.textContent).not.toMatch(
      /\b(?:GMT|UTC)[+-]?\d*\b/,
    );
    const systemTime = container.querySelector('[data-testid="system-time"]')?.textContent;
    expect(container.querySelector('[data-testid="system-time-timezone"]')?.textContent).toMatch(
      new RegExp(`^${systemTime}\\s\\S+`),
    );
  });
});

describe("resizable regions", () => {
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
});

describe("resizable state restoration", () => {
  it("returns named regions directly and persists them independently", () => {
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

  it("uses multi-region direction for resize handles", () => {
    const container = mount(() => {
      const regions = useResizable({
        direction: "vertical",
        regions: { panel: { defaultSize: 200 } },
      });
      return <ResizeHandle label="Resize panel" resizable={regions.panel.props} />;
    });

    expect(container.querySelector('[role="separator"]')?.getAttribute("aria-orientation")).toBe(
      "horizontal",
    );
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
});

describe("resizable handle interactions", () => {
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
});

describe("resizable keyboard and pointer input", () => {
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
