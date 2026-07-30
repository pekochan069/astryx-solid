interface SavedStyle {
  value: string;
  priority: string;
}

interface LockState {
  tokens: Set<symbol>;
  styles: Map<string, SavedStyle>;
  x: number;
  y: number;
}

const states = new WeakMap<Document, LockState>();
const properties = ["overflow", "position", "top", "left", "right"];

export function lockScroll(ownerDocument: Document): () => void {
  let state = states.get(ownerDocument);
  if (!state) {
    state = {
      tokens: new Set(),
      styles: new Map(),
      x: ownerDocument.defaultView?.scrollX ?? 0,
      y: ownerDocument.defaultView?.scrollY ?? 0,
    };
    states.set(ownerDocument, state);
    const body = ownerDocument.body;
    for (const property of properties) {
      state.styles.set(property, {
        value: body.style.getPropertyValue(property),
        priority: body.style.getPropertyPriority(property),
      });
    }
    body.style.setProperty("overflow", "hidden");
    body.style.setProperty("position", "fixed");
    body.style.setProperty("top", `${-state.y}px`);
    body.style.setProperty("left", `${-state.x}px`);
    body.style.setProperty("right", "0");
  }

  const token = Symbol("scroll-lock");
  state.tokens.add(token);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const current = states.get(ownerDocument);
    if (!current) return;
    current.tokens.delete(token);
    if (current.tokens.size) return;
    const body = ownerDocument.body;
    for (const property of properties) {
      const saved = current.styles.get(property)!;
      if (saved.value) body.style.setProperty(property, saved.value, saved.priority);
      else body.style.removeProperty(property);
    }
    ownerDocument.defaultView?.scrollTo(current.x, current.y);
    states.delete(ownerDocument);
  };
}
