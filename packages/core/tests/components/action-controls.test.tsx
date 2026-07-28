import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";

import { Button } from "../../src/components/button";
import { ButtonGroup } from "../../src/components/button-group";
import { IconButton } from "../../src/components/icon-button";

let dispose: VoidFunction | undefined;
function mount(view: () => JSX.Element) {
  const root = document.createElement("div");
  document.body.append(root);
  dispose = render(view, root);
  return root;
}
function keydown(key: string) {
  const event = new Event("keydown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "key", { value: key });
  return event;
}
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
});

describe("Button actions", () => {
  it("runs consumer callback before action and honors cancellation", () => {
    const calls: string[] = [];
    const root = mount(() => (
      <Button
        label="Save"
        onClick={(event) => {
          calls.push("click");
          event.preventDefault();
        }}
        clickAction={() => {
          calls.push("action");
        }}
      />
    ));
    root.querySelector("button")?.click();
    expect(calls).toEqual(["click"]);
  });

  it("dedupes non-interruptible actions in same tick and while pending", async () => {
    const work = deferred();
    const action = mock(() => work.promise);
    const root = mount(() => <Button label="Save" clickAction={action} />);
    const button = root.querySelector("button")!;
    button.click();
    button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(action).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(root.querySelector("button")?.getAttribute("aria-busy")).toBe("true");
    work.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(root.querySelector("button")?.getAttribute("aria-busy")).toBeNull();
  });

  it("counts overlapping interruptible actions", async () => {
    const first = deferred();
    const second = deferred();
    let call = 0;
    const root = mount(() => (
      <Button
        label="Refresh"
        isInterruptible
        clickAction={() => (++call === 1 ? first.promise : second.promise)}
      />
    ));
    const button = root.querySelector("button")!;
    button.click();
    button.click();
    expect(call).toBe(2);
    second.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(root.querySelector("button")?.getAttribute("aria-busy")).toBe("true");
    first.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(root.querySelector("button")?.getAttribute("aria-busy")).toBeNull();
  });

  it("preserves link and form roots", () => {
    const root = mount(() => (
      <>
        <Button label="Submit" type="submit" name="intent" value="save" />
        <Button label="Docs" href="/docs" target="_blank" />
      </>
    ));
    const button = root.querySelector("button")!;
    const link = root.querySelector("a")!;
    expect([button.type, button.name, button.value]).toEqual(["submit", "intent", "save"]);
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("ButtonGroup and IconButton", () => {
  it("moves focus with arrows, Home, and End while preserving tab order", () => {
    const root = mount(() => (
      <ButtonGroup label="Actions">
        <Button label="One" />
        <Button label="Disabled" isDisabled />
        <Button label="Three" href="/three" />
      </ButtonGroup>
    ));
    const [one, disabled, three] = root.querySelectorAll<HTMLElement>("button, a");
    one.focus();
    one.dispatchEvent(keydown("ArrowRight"));
    expect(document.activeElement).toBe(three);
    three.dispatchEvent(keydown("Home"));
    expect(document.activeElement).toBe(one);
    expect([one.tabIndex, disabled.tabIndex, three.tabIndex]).toEqual([0, 0, 0]);
  });

  it("lets consumer cancel group keyboard movement", () => {
    const root = mount(() => (
      <ButtonGroup label="Actions" onKeyDown={(event) => event.preventDefault()}>
        <Button label="One" />
        <Button label="Two" />
      </ButtonGroup>
    ));
    const [one] = root.querySelectorAll<HTMLElement>("button");
    one.focus();
    one.dispatchEvent(keydown("ArrowRight"));
    expect(document.activeElement).toBe(one);
  });

  it("keeps IconButton a thin action composition with focus tooltip", () => {
    const action = mock();
    const root = mount(() => (
      <IconButton label="Settings" icon="⚙" clickAction={action} isDisabled tooltip="Unavailable" />
    ));
    const button = root.querySelector("button")!;
    button.focus();
    button.click();
    expect(button.getAttribute("aria-label")).toBe("Settings");
    expect(document.getElementById(button.getAttribute("aria-describedby") ?? "")?.role).toBe(
      "tooltip",
    );
    expect(action).not.toHaveBeenCalled();
  });
});
