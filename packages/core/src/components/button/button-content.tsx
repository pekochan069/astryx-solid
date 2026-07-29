import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";

import type { ButtonProps, ButtonSize } from "./button.tsx";

import { Spinner } from "../spinner/spinner.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";
import { iconSizeStyles, loadingStyles, styles } from "./button.stylex.ts";

interface ButtonContentProps {
  button: ButtonProps;
  size: ButtonSize;
  loading: boolean;
  delaySpinner: boolean;
}

export function ButtonContent(props: ButtonContentProps): JSX.Element {
  return (
    <>
      <Show when={props.loading}>
        <span
          {...stylex.attrs(
            loadingStyles.spinnerOverlay,
            props.delaySpinner && loadingStyles.spinnerDelayed,
          )}
          aria-hidden="true"
        >
          <Spinner size="sm" shade="inherit" />
        </span>
      </Show>
      <span
        {...stylex.attrs(
          styles.contentWrapper,
          props.loading &&
            (props.delaySpinner ? loadingStyles.hiddenContentDelayed : loadingStyles.hiddenContent),
        )}
        aria-hidden={props.loading ? "true" : undefined}
      >
        <Show when={props.button.icon}>
          {(icon) => (
            <span {...stylex.attrs(styles.iconWrapper, iconSizeStyles[props.size])}>{icon()}</span>
          )}
        </Show>
        <Show when={!props.button.isIconOnly}>
          <span {...stylex.attrs(styles.labelText)}>
            {props.button.children ?? props.button.label}
          </span>
        </Show>
        <Show when={!props.button.isIconOnly && props.button.endContent != null}>
          <span {...stylex.attrs(styles.endContentWrapper)}>{props.button.endContent}</span>
        </Show>
      </span>
      <VisuallyHidden
        role="status"
        aria-live="polite"
        textContent={props.loading ? "Loading" : ""}
      />
    </>
  );
}
