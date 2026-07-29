import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { createSignal } from "solid-js";

import { ToggleButton, ToggleButtonGroup } from "../../../src/components/toggle-button";

let dispose: VoidFunction | undefined;
function mount(view: () => JSX.Element) {
  const root = document.createElement("div");
  document.body.append(root);
  dispose = render(view, root);
  return root;
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

describe("ToggleButton", () => {
  it("reports controlled state with originating event", async () => {
    const [pressed, setPressed] = createSignal(false);
    let original: MouseEvent | undefined;
    const root = mount(() => (
      <ToggleButton
        label="Bold"
        isPressed={pressed()}
        onPressedChange={(next, event) => {
          original = event;
          setPressed(next);
        }}
      />
    ));
    const button = root.querySelector("button")!;
    button.click();
    await Promise.resolve();
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(original).toBeInstanceOf(MouseEvent);
  });

  it("cancels async action and derives rapid intent optimistically", async () => {
    const canceled = mock();
    let root = mount(() => (
      <ToggleButton
        label="Cancel"
        onPressedChange={(_, event) => event.preventDefault()}
        pressedChangeAction={canceled}
      />
    ));
    root.querySelector("button")?.click();
    expect(canceled).not.toHaveBeenCalled();
    dispose?.();
    document.body.replaceChildren();
    const pending = [deferred(), deferred(), deferred()];
    const intents: boolean[] = [];
    root = mount(() => (
      <ToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={(next) => intents.push(next)}
        pressedChangeAction={(_next) => pending[intents.length - 1].promise}
      />
    ));
    const button = root.querySelector("button")!;
    button.click();
    button.click();
    button.click();
    expect(intents).toEqual([true, false, true]);
    await Promise.resolve();
    expect(root.querySelector("button")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("swaps pressed icon, reserves label width, and adds icon tooltip", async () => {
    const [pressed, setPressed] = createSignal(false);
    const root = mount(() => (
      <>
        <ToggleButton
          label="Star"
          icon="☆"
          pressedIcon="★"
          isPressed={pressed()}
          onPressedChange={setPressed}
        />
        <ToggleButton label="Menu" icon="☰" isIconOnly />
      </>
    ));
    const [button, iconOnly] = root.querySelectorAll("button");
    button.click();
    await Promise.resolve();
    expect(button.textContent).toContain("★");
    expect(button.textContent).toContain("Star");
    const reservation = Array.from(button.querySelectorAll('[aria-hidden="true"]')).find(
      (element) => element.textContent === "Star",
    );
    expect(reservation).toBeDefined();
    iconOnly.focus();
    expect(
      document.getElementById(iconOnly.getAttribute("aria-describedby") ?? "")?.textContent,
    ).toBe("Menu");
  });
});

describe("ToggleButtonGroup", () => {
  it("supports nullable single selection and group ownership", async () => {
    const [value, setValue] = createSignal<string | null>("grid");
    const child = mock();
    const root = mount(() => (
      <ToggleButtonGroup label="View" value={value()} onChange={setValue}>
        <ToggleButton label="Grid" value="grid" onPressedChange={child} />
        <ToggleButton label="List" value="list" />
      </ToggleButtonGroup>
    ));
    const [grid, list] = root.querySelectorAll("button");
    expect(grid.getAttribute("aria-pressed")).toBe("true");
    grid.click();
    await Promise.resolve();
    expect(value()).toBeNull();
    list.click();
    await Promise.resolve();
    expect(value()).toBe("list");
    expect(child).not.toHaveBeenCalled();
  });

  it("updates multiple selection immutably and applies group disabled", () => {
    const original = ["bold"];
    let next: readonly string[] = original;
    const root = mount(() => (
      <ToggleButtonGroup
        type="multiple"
        label="Format"
        value={original}
        onChange={(value) => {
          next = value;
        }}
        isDisabled
      >
        <ToggleButton label="Bold" value="bold" />
        <ToggleButton label="Italic" value="italic" />
      </ToggleButtonGroup>
    ));
    root.querySelectorAll("button")[1].click();
    expect(next).toBe(original);
    expect(root.querySelectorAll("button")[1].disabled).toBe(true);
  });
});
