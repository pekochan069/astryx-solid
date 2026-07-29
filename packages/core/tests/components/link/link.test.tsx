import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createSignal } from "solid-js";

import { Link, LinkProvider, useLinkify, type LinkComponent } from "../../../src/components/link";

let dispose: VoidFunction | undefined;
function mount(view: () => JSX.Element) {
  const root = document.createElement("div");
  document.body.append(root);
  dispose = render(view, root);
  return root;
}
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

const Adapter: LinkComponent = (props) => <a {...props} data-adapter="true" />;

describe("Link", () => {
  it("renders native roots and safe external relations", () => {
    const root = mount(() => (
      <>
        <Link>Action</Link>
        <Link href="/docs">Docs</Link>
        <Link href="https://example.com" rel="author" isExternalLink>
          Example
        </Link>
      </>
    ));
    const [button, link, external] = root.children;
    expect(button.tagName).toBe("BUTTON");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(external.getAttribute("target")).toBe("_blank");
    expect(external.getAttribute("rel")).toBe("author noopener noreferrer");
    expect(external.textContent).toContain("opens in new tab");
  });

  it("uses provider and local adapters reactively", async () => {
    const [local, setLocal] = createSignal<LinkComponent>();
    const root = mount(() => (
      <LinkProvider component={Adapter}>
        <Link href="/one" as={local()}>
          One
        </Link>
      </LinkProvider>
    ));
    expect(root.querySelector("a")?.dataset.adapter).toBe("true");
    const Local: LinkComponent = (props) => <a {...props} data-local="true" />;
    setLocal(() => Local);
    await Promise.resolve();
    expect(root.querySelector("a")?.dataset.local).toBe("true");
  });

  it("keeps disabled links inert and skips consumer callbacks", () => {
    const onClick = mock();
    const root = mount(() => (
      <Link href="/unsafe" isDisabled onClick={onClick}>
        Disabled
      </Link>
    ));
    const link = root.firstElementChild;
    expect(link?.tagName).toBe("A");
    expect(link?.hasAttribute("href")).toBe(false);
    link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("assigns truthful refs after reactive root changes", async () => {
    const [href, setHref] = createSignal<string>();
    const roots: Element[] = [];
    mount(() => (
      <Link href={href()} ref={(element) => roots.push(element)}>
        Root
      </Link>
    ));
    setHref("/next");
    await Promise.resolve();
    expect(roots.map((root) => root.tagName)).toEqual(["BUTTON", "A"]);
  });
});

describe("useLinkify", () => {
  it("linkifies URLs, email, punctuation, and reactive text", async () => {
    const [text, setText] = createSignal("See https://example.com, email hi@example.com.");
    const root = mount(() => {
      const nodes = useLinkify(text);
      return <p>{nodes()}</p>;
    });
    expect([...root.querySelectorAll("a")].map((link) => link.getAttribute("href"))).toEqual([
      "https://example.com",
      "mailto:hi@example.com",
    ]);
    setText("");
    await Promise.resolve();
    expect(root.textContent).toBe("");
  });

  it("prioritizes ordered custom patterns", () => {
    const root = mount(() => {
      const nodes = useLinkify(() => "T123", {
        patterns: () => [{ pattern: /T\d+/g, href: (match) => `/ticket/${match[0]}` }],
        hasBuiltins: () => false,
      });
      return <p>{nodes()}</p>;
    });
    expect(root.querySelector("a")?.getAttribute("href")).toBe("/ticket/T123");
  });
});
