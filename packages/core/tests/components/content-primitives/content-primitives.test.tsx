import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createSignal } from "solid-js";

import { Badge } from "../../../src/components/badge/badge";
import { Blockquote } from "../../../src/components/blockquote/blockquote";
import { Citation } from "../../../src/components/citation/citation";
import { Code } from "../../../src/components/code/code";
import { Divider } from "../../../src/components/divider/divider";
import { Heading } from "../../../src/components/heading/heading";
import { getIcon, Icon, registerIcons, resetIcons } from "../../../src/components/icon/icon";
import { Kbd } from "../../../src/components/kbd/kbd";
import { Skeleton } from "../../../src/components/skeleton/skeleton";
import { Spinner } from "../../../src/components/spinner/spinner";
import { Text } from "../../../src/components/text/text";

let dispose: VoidFunction | undefined;

function TestIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return <svg data-testid="icon" {...props} />;
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

describe("content structure", () => {
  it("renders semantic text, heading, code, quote, and divider content", () => {
    const container = mount(() => (
      <>
        <Text as="p">Body</Text>
        <Heading level={2}>Heading</Heading>
        <Code>const value = 1</Code>
        <Blockquote cite="Author">Quote</Blockquote>
        <Divider label="Section" />
      </>
    ));

    expect(container.querySelector("p")?.textContent).toBe("Body");
    expect(container.querySelector("h2")?.textContent).toBe("Heading");
    expect(container.querySelector("code")?.textContent).toBe("const value = 1");
    expect(container.querySelector("blockquote")?.getAttribute("cite")).toBeNull();
    expect(container.querySelector("blockquote footer cite")?.textContent).toBe("Author");
    expect(container.querySelector('[role="separator"]')?.getAttribute("aria-orientation")).toBe(
      "horizontal",
    );
  });

  it("omits absent divider labels and citation icons", () => {
    const container = mount(() => (
      <>
        <Divider data-testid="divider" />
        <Citation data-testid="citation" source={{ title: "Reference" }} number={1} />
      </>
    ));

    const divider = container.querySelector('[data-testid="divider"]');
    const citation = container.querySelector('[data-testid="citation"]');

    expect(divider?.children).toHaveLength(1);
    expect(citation?.querySelector("img")).toBeNull();
    expect(citation?.textContent).toBe("Reference");
  });
});

describe("content reactivity and refs", () => {
  it("forwards measured and conditional root refs", () => {
    let textRef: HTMLElement | undefined;
    let headingRef: HTMLHeadingElement | undefined;
    let labelledSpinnerRef: HTMLSpanElement | HTMLDivElement | undefined;
    let spinnerRef: HTMLSpanElement | HTMLDivElement | undefined;

    mount(() => (
      <>
        <Text ref={(element) => (textRef = element)}>Body</Text>
        <Heading ref={(element) => (headingRef = element)} level={2}>
          Heading
        </Heading>
        <Spinner ref={(element) => (labelledSpinnerRef = element)} label="Loading" />
        <Spinner ref={(element) => (spinnerRef = element)} />
      </>
    ));

    expect(textRef?.tagName).toBe("SPAN");
    expect(headingRef?.tagName).toBe("H2");
    expect(labelledSpinnerRef?.tagName).toBe("DIV");
    expect(spinnerRef?.tagName).toBe("SPAN");
  });

  it("updates citation root when URL changes", async () => {
    const [url, setUrl] = createSignal<string>();
    const container = mount(() => (
      <Citation source={{ title: "Reference", url: url() }} number={1} />
    ));

    expect(container.firstElementChild?.tagName).toBe("SPAN");

    setUrl("https://example.com");
    await Promise.resolve();

    expect(container.firstElementChild?.tagName).toBe("A");

    setUrl(undefined);
    await Promise.resolve();

    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("updates truncation titles when max lines changes", async () => {
    const [maxLines, setMaxLines] = createSignal(0);
    const container = mount(() => <Text maxLines={maxLines()}>Long text</Text>);
    const text = container.querySelector("span");

    if (text === null) throw new Error("Expected text element");
    Object.defineProperties(text, {
      offsetWidth: { value: 1 },
      scrollWidth: { value: 100 },
    });
    setMaxLines(1);
    await Promise.resolve();

    expect(text.getAttribute("title")).toBe("Long text");
  });
});

describe("content feedback and icons", () => {
  it("renders feedback accessibility contracts", () => {
    const container = mount(() => (
      <>
        <Badge variant="success" label="Ready" />
        <Icon icon={TestIcon} aria-label="Success" aria-hidden={false} />
        <Kbd keys="ctrl+enter" />
        <Skeleton width={20} height={10} />
        <Spinner label="Loading records" />
        <Citation
          source={{ title: "Reference", url: "https://example.com" }}
          number={4}
          target="_blank"
          rel="author"
        />
      </>
    ));

    expect(container.textContent).toContain("Ready");
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe("Success");
    expect(container.querySelector("svg")?.hasAttribute("iconValue")).toBe(false);
    expect(container.querySelector("kbd")?.textContent).toBe("⌃");
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe(
      "Loading records",
    );

    const spinnerLabel = container.querySelector('[role="status"]')?.nextElementSibling;

    expect(spinnerLabel?.className.includes("astryx-solid-text")).toBe(true);
    expect(spinnerLabel?.getAttribute("data-type")).toBe("body");
    const citation = container.querySelector("a");

    expect(citation?.getAttribute("href")).toBe("https://example.com");
    expect(citation?.getAttribute("role")).toBe("doc-noteref");
    expect(citation?.getAttribute("target")).toBe("_blank");
    expect(citation?.getAttribute("rel")?.split(" ").sort()).toEqual([
      "author",
      "noopener",
      "noreferrer",
    ]);
  });

  it("renders wrapped built-in icons and only titles measured truncation", () => {
    const container = mount(() => (
      <>
        <Icon icon="menu" aria-label="Menu" aria-hidden={false} data-testid="built-in-icon" />
        <Icon icon="svg" aria-label="Custom" data-testid="intrinsic-icon" />
        <Text maxLines={1}>Short text</Text>
        <Heading level={2} maxLines={1}>
          Short heading
        </Heading>
      </>
    ));

    const builtInIcon = container.querySelector('[data-testid="built-in-icon"]');
    const intrinsicIcon = container.querySelector('[data-testid="intrinsic-icon"]');
    const text = [...container.querySelectorAll("span")].find(
      (element) => element.textContent === "Short text",
    );

    expect(getIcon("close")).toBeDefined();
    expect(builtInIcon?.tagName).toBe("SPAN");
    expect(builtInIcon?.getAttribute("aria-label")).toBe("Menu");
    expect(builtInIcon?.getAttribute("aria-hidden")).not.toBe("true");
    expect(builtInIcon?.querySelector("svg")?.getAttribute("stroke-width")).toBe("2");
    expect(intrinsicIcon?.tagName).toBe("svg");
    expect(text?.getAttribute("title")).toBeNull();
    expect(container.querySelector("h2")?.getAttribute("title")).toBeNull();
  });

  it("wraps registered icon elements without leaking SVG props", () => {
    registerIcons({ close: <svg data-testid="registered-value" /> });
    const container = mount(() => (
      <Icon icon="close" aria-label="Close" viewBox="0 0 24 24" data-testid="icon-root" />
    ));

    const wrapper = container.querySelector('[data-testid="icon-root"]');

    expect(wrapper?.tagName).toBe("SPAN");
    expect(wrapper?.getAttribute("aria-label")).toBe("Close");
    expect(wrapper?.hasAttribute("viewBox")).toBe(false);
    expect(wrapper?.hasAttribute("iconValue")).toBe(false);
    expect(wrapper?.querySelector('[data-testid="registered-value"]')).not.toBeNull();
  });
});
