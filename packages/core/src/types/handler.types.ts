/**
 * Mouse event received by Astryx click handlers.
 *
 * Narrows `currentTarget` to the element that owns the handler while retaining
 * the native event target.
 */
export type OnClickEventType<T extends HTMLElement> = MouseEvent & {
  currentTarget: T;
  target: Element;
};

/** Typed click callback for an Astryx component root element. */
export type OnClick<T extends HTMLElement = HTMLElement> = (event: OnClickEventType<T>) => void;
