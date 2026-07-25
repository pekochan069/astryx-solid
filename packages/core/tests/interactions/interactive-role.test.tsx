import { render, type JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createSignal } from "solid-js";

import { InteractiveRoleContext, type InteractiveRole, useInteractiveRole } from "../../src/index";

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

function RoleProbe() {
  const role = useInteractiveRole({});
  return <span data-testid="role">{role()}</span>;
}

describe("interactive role context", () => {
  it("updates a consumer when its optional role context changes", async () => {
    const [contextRole, setContextRole] = createSignal<InteractiveRole>("button");
    const container = mount(() => (
      <InteractiveRoleContext
        value={{
          get role() {
            return contextRole();
          },
        }}
      >
        <RoleProbe />
      </InteractiveRoleContext>
    ));

    expect(container.querySelector('[data-testid="role"]')?.textContent).toBe("button");
    setContextRole("link");
    await Promise.resolve();
    expect(container.querySelector('[data-testid="role"]')?.textContent).toBe("link");
  });
});
