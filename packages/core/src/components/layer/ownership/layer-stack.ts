export interface LayerRegistration {
  host: HTMLElement;
  lightDismiss: boolean;
  close: () => void;
}

interface PointerState {
  entry: LayerRegistration;
  target: EventTarget | null;
}

interface Registry {
  entries: LayerRegistration[];
  pointer?: PointerState;
  onKeyDown: (event: KeyboardEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
}

const registries = new WeakMap<Document, Registry>();

function getRegistry(ownerDocument: Document): Registry {
  let registry = registries.get(ownerDocument);
  if (registry) return registry;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.isComposing || event.keyCode === 229) return;
    const entry = registry?.entries.at(-1);
    if (!entry || !entry.lightDismiss || event.defaultPrevented) return;
    event.preventDefault();
    entry.close();
  };

  const onPointerDown = (event: PointerEvent) => {
    const entry = registry?.entries.at(-1);
    if (!entry || !entry.lightDismiss) return;
    registry!.pointer = { entry, target: event.target };
  };

  const onPointerUp = (event: PointerEvent) => {
    const state = registry?.pointer;
    registry!.pointer = undefined;
    if (!state || state.entry !== registry?.entries.at(-1)) return;
    const downOutside = !state.entry.host.contains(state.target as Node | null);
    const upOutside = !state.entry.host.contains(event.target as Node | null);
    if (downOutside && upOutside) state.entry.close();
  };

  registry = { entries: [], onKeyDown, onPointerDown, onPointerUp };
  registries.set(ownerDocument, registry);
  return registry;
}

function syncListeners(ownerDocument: Document, registry: Registry) {
  if (registry.entries.length === 1) {
    ownerDocument.addEventListener("keydown", registry.onKeyDown);
    ownerDocument.addEventListener("pointerdown", registry.onPointerDown);
    ownerDocument.addEventListener("pointerup", registry.onPointerUp);
  }
  if (registry.entries.length === 0) {
    ownerDocument.removeEventListener("keydown", registry.onKeyDown);
    ownerDocument.removeEventListener("pointerdown", registry.onPointerDown);
    ownerDocument.removeEventListener("pointerup", registry.onPointerUp);
    registry.pointer = undefined;
    registries.delete(ownerDocument);
  }
}

export function registerLayer(ownerDocument: Document, entry: LayerRegistration): () => void {
  const registry = getRegistry(ownerDocument);
  registry.entries.push(entry);
  syncListeners(ownerDocument, registry);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const index = registry.entries.indexOf(entry);
    if (index !== -1) registry.entries.splice(index, 1);
    syncListeners(ownerDocument, registry);
  };
}

export function topLayer(ownerDocument: Document): LayerRegistration | undefined {
  return registries.get(ownerDocument)?.entries.at(-1);
}
