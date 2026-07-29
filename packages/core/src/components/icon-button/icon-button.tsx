import type { JSX } from "@solidjs/web";

import { Button, type ButtonProps } from "../button/button.tsx";

/** Props for an icon-only Button. */
export interface IconButtonProps extends Omit<
  ButtonProps,
  "isIconOnly" | "children" | "endContent"
> {
  /** Icon rendered inside button. */
  icon: JSX.Element;
}

/** Icon-only Button composition. */
export function IconButton(props: IconButtonProps) {
  return <Button {...props} isIconOnly />;
}
