import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";

import type { ButtonProps, ButtonSize } from "./button.tsx";

import { Spinner } from "../spinner/spinner.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";
import { iconSizeStyles, loadingStyles, styles } from "./button.stylex.ts";

interface ButtonContentProps {
  button: ButtonProps;
  size: ButtonSize;
  loading: boolean;
}

export function ButtonContent(props: ButtonContentProps): JSX.Element {
  return (
    <>
      <span
        {...stylex.attrs(loadingStyles.overlay)}
        style={{ display: props.loading ? "grid" : "none" }}
        aria-hidden="true"
      >
        <Spinner size="sm" shade="inherit" />
      </span>
      <span
        {...stylex.attrs(styles.contentWrapper)}
        style={{ visibility: props.loading ? "hidden" : undefined }}
        aria-hidden={props.loading ? "true" : undefined}
      >
        <span
          {...stylex.attrs(
            styles.iconWrapper,
            props.size === "lg" && iconSizeStyles.lg,
            props.size !== "lg" && iconSizeStyles.md,
          )}
          hidden={props.button.icon == null}
        >
          {props.button.icon}
        </span>
        <span {...stylex.attrs(styles.labelText)} hidden={props.button.isIconOnly}>
          {props.button.isIconOnly ? undefined : (props.button.children ?? props.button.label)}
        </span>
        <span
          {...stylex.attrs(styles.endContentWrapper)}
          hidden={props.button.isIconOnly || props.button.endContent == null}
        >
          {props.button.isIconOnly ? undefined : props.button.endContent}
        </span>
      </span>
      <VisuallyHidden
        role="status"
        aria-live="polite"
        textContent={props.loading ? "Loading" : ""}
      />
    </>
  );
}
