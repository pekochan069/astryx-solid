# Core reactive interaction substrate

Core components keep Solid prop objects reactive. Read props only in JSX, memos, accessors, or other tracked scopes. `value !== undefined` defines controlled ownership; `defaultValue` initializes only uncontrolled state, and ownership-mode switching emits a development diagnostic. Components implement this contract locally—there is no universal controlled-state helper.

Use native camel-case DOM events. `composeEventHandlers` runs handlers in declared order and stops at `event.preventDefault()`. Components document whether consumer or component behavior runs first.

Use Solid assignable or array refs and `createUniqueId()` directly. Browser listeners, observers, timers, and imperative resources start in a ref directive or `onSettled`, then return cleanup from that owning scope. No React-shaped ref or lifecycle wrappers are provided.

`SizeContext` is a fallback context with `value={{ get size() { return size() } }}`. `useSize()` and `useInteractiveRole()` return accessors so reactive props and context updates remain tracked. `InteractiveRoleContext` is optional and uses the same getter-bearing `role` value shape.

Substrate modules never import UI component barrels. This keeps later Button, overlay, form, and collection ports independent of the legacy Core cycle.
