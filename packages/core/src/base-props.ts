import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "@solidjs/web";

export interface BaseProps<T extends HTMLElement = HTMLElement> extends Omit<
  JSX.HTMLAttributes<T>,
  "children"
> {
  xstyle?: StyleXStyles;
  [key: `data-${string}`]: string | undefined;
}
