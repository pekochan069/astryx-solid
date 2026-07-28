import type { JSX } from "@solidjs/web";

import { Button, type ButtonProps } from "../button/button.tsx";

export interface IconButtonProps extends Omit<
  ButtonProps,
  "isIconOnly" | "children" | "endContent" | "icon"
> {
  icon: JSX.Element;
}
/** Icon-only Button composition. */
export function IconButton(props: IconButtonProps) {
  return <Button {...props} isIconOnly />;
}
