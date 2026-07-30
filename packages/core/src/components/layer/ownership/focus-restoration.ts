export interface FocusRecord {
  origin: Element | null;
  ownerDocument: Document;
  cancel: () => void;
  restore: (host: HTMLElement) => void;
}

export function captureFocus(ownerDocument: Document): FocusRecord {
  const origin = ownerDocument.activeElement;
  let cancelled = false;
  let frame = 0;

  const cancel = () => {
    cancelled = true;
    if (frame) ownerDocument.defaultView?.cancelAnimationFrame(frame);
  };

  const restore = (host: HTMLElement) => {
    if (cancelled || !origin || !origin.isConnected) return;
    const active = ownerDocument.activeElement;
    const focusLost =
      !active || active === ownerDocument.body || active === ownerDocument.documentElement;
    if (!focusLost && !host.contains(active)) return;
    frame =
      ownerDocument.defaultView?.requestAnimationFrame(() => {
        if (cancelled || !origin.isConnected) return;
        const focus = Reflect.get(origin, "focus");
        if (typeof focus === "function") focus.call(origin);
      }) ?? 0;
  };

  return { origin, ownerDocument, cancel, restore };
}
