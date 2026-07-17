// import type { JSX } from "@solidjs/web";
// export type OnClick<T extends HTMLElement> = JSX.EventHandlerUnion<T, MouseEvent>;

export type OnClickEventType<T extends HTMLElement> = MouseEvent & {
  currentTarget: T;
  target: Element;
};
export type OnClick<T extends HTMLElement = HTMLElement> = (event: OnClickEventType<T>) => void;
