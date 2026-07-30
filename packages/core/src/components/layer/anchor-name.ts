interface AnchorState {
  names: Set<string>;
  value: string;
  priority: string;
}

const ownedNames = new WeakMap<HTMLElement, AnchorState>();

function stateFor(element: HTMLElement): AnchorState {
  let state = ownedNames.get(element);
  if (!state) {
    state = {
      names: new Set(),
      value: element.style.getPropertyValue("anchor-name"),
      priority: element.style.getPropertyPriority("anchor-name"),
    };
    ownedNames.set(element, state);
  }
  return state;
}

function writeNames(element: HTMLElement, state: AnchorState): void {
  const names = state.value ? [state.value, ...state.names] : [...state.names];
  if (names.length) element.style.setProperty("anchor-name", names.join(", "), state.priority);
  else element.style.removeProperty("anchor-name");
}

export function addAnchorName(element: HTMLElement, name: string): void {
  const state = stateFor(element);
  state.names.add(name);
  writeNames(element, state);
}

export function removeAnchorName(element: HTMLElement, name: string): void {
  const state = ownedNames.get(element);
  if (!state) return;
  state.names.delete(name);
  writeNames(element, state);
  if (!state.names.size) {
    if (!state.value) element.style.removeProperty("anchor-name");
    ownedNames.delete(element);
  }
}
