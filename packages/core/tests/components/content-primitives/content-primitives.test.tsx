import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";

import { Badge } from "../../../src/components/badge/badge";
import { Blockquote } from "../../../src/components/blockquote/blockquote";
import { Citation } from "../../../src/components/citation/citation";
import { Code } from "../../../src/components/code/code";
import { Divider } from "../../../src/components/divider/divider";
import { Heading } from "../../../src/components/heading/heading";
import { Icon } from "../../../src/components/icon/icon";
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
  document.body.replaceChildren();
});

describe("content primitives", () => {
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
    expect(container.querySelector("blockquote footer cite")?.textContent).toBe("Author");
    expect(container.querySelector('[role="separator"]')?.getAttribute("aria-orientation")).toBe(
      "horizontal",
    );
  });

  it("renders feedback, icon, keyboard, and citation accessibility contracts", () => {
    const container = mount(() => (
      <>
        <Badge variant="success" label="Ready" />
        <Icon icon={TestIcon} aria-label="Success" aria-hidden={false} />
        <Kbd keys="ctrl+enter" />
        <Skeleton width={20} height={10} />
        <Spinner label="Loading records" />
        <Citation source={{ title: "Reference", url: "https://example.com" }} number={4} />
      </>
    ));

    expect(container.textContent).toContain("Ready");
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe("Success");
    expect(container.querySelector("kbd")?.textContent).toBe("⌃");
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe(
      "Loading records",
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com");
  });
});
