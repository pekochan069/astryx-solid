import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, radiusVars, spacingVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { Skeleton } from "../skeleton/skeleton";
import { Spinner } from "../spinner/spinner";

export interface ThumbnailProps extends BaseProps<HTMLDivElement> {
  src?: string;
  alt?: string;
  label?: string;
  onRemove?: (event: MouseEvent) => void;
  onClick?: (event: MouseEvent) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const styles = stylex.create({
  root: { position: "relative", display: "inline-flex", width: 64, flexShrink: 0 },
  frame: {
    position: "relative",
    width: "100%",
    aspectRatio: "1",
    overflow: "hidden",
    borderRadius: radiusVars["--radius-element"],
    backgroundColor: colorVars["--color-neutral"],
  },
  image: { width: "100%", height: "100%", display: "block", objectFit: "cover" },
  placeholder: {
    display: "grid",
    width: "100%",
    height: "100%",
    placeItems: "center",
    color: colorVars["--color-icon-secondary"],
  },
  button: {
    all: "unset",
    cursor: "pointer",
    display: "block",
    width: "100%",
    height: "100%",
    ":hover": { opacity: 0.85 },
    ":active": { opacity: 0.75 },
    ":focus-visible": { outline: `2px solid ${colorVars["--color-accent"]}`, outlineOffset: 2 },
  },
  remove: {
    position: "absolute",
    top: spacingVars["--spacing-1"],
    right: spacingVars["--spacing-1"],
    padding: spacingVars["--spacing-1"],
    borderRadius: radiusVars["--radius-full"],
    backgroundColor: colorVars["--color-background-surface"],
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    backgroundColor: colorVars["--color-overlay"],
  },
  disabled: { opacity: 0.5, pointerEvents: "none" },
});

function Placeholder() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M3 3h18v18H3zM6 17l4-5 3 4 2-2 3 3z" />
    </svg>
  );
}

type ThumbnailContentsProps = {
  src?: string;
  failedSrc?: string;
  isLoading?: boolean;
  alt?: string;
  setFailedSrc: (src: string | undefined) => void;
};

function ThumbnailContents(props: ThumbnailContentsProps) {
  return (
    <>
      <Show
        when={props.src != null && props.failedSrc !== props.src}
        fallback={
          <Show
            when={props.isLoading}
            fallback={
              <div {...stylexProps(styles.placeholder)}>
                <Placeholder />
              </div>
            }
          >
            <Skeleton width="100%" height="100%" radius={2} />
          </Show>
        }
      >
        <img
          {...stylexProps(styles.image)}
          src={props.src}
          alt={props.alt ?? ""}
          onError={() => props.setFailedSrc(props.src)}
        />
      </Show>
      <Show when={props.isLoading && props.src != null && props.failedSrc !== props.src}>
        <div {...stylexProps(styles.overlay)}>
          <Spinner shade="inherit" />
        </div>
      </Show>
    </>
  );
}

export function Thumbnail(props: ThumbnailProps) {
  const rest = omit(
    props,
    "src",
    "alt",
    "label",
    "onRemove",
    "onClick",
    "isLoading",
    "isDisabled",
    "xstyle",
    "class",
    "style",
  );

  const [failedSrc, setFailedSrc] = createSignal<string>();
  const name = () =>
    props.label && props.alt
      ? `${props.label} — ${props.alt}`
      : (props.label ?? props.alt ?? "thumbnail");
  const interactive = () => props.onClick != null && !props.isDisabled && !props.isLoading;

  const theme = createMemo(() => themeProps("thumbnail"));
  const style = createMemo(() =>
    stylexProps(styles.root, props.isDisabled && styles.disabled, props.xstyle),
  );

  return (
    <div
      {...rest}
      {...theme()}
      role="group"
      aria-label={name()}
      title={props.label}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div {...stylexProps(styles.frame)}>
        <Show
          when={interactive()}
          fallback={
            <ThumbnailContents
              src={props.src}
              failedSrc={failedSrc()}
              isLoading={props.isLoading}
              alt={props.alt}
              setFailedSrc={setFailedSrc}
            />
          }
        >
          <button
            type="button"
            {...stylexProps(styles.button)}
            aria-label={`Open ${name()}`}
            onClick={(event) => props.onClick?.(event)}
          >
            <ThumbnailContents
              src={props.src}
              failedSrc={failedSrc()}
              isLoading={props.isLoading}
              alt={props.alt}
              setFailedSrc={setFailedSrc}
            />
          </button>
        </Show>
        <Show when={props.onRemove != null && !props.isDisabled}>
          <button
            type="button"
            {...stylexProps(styles.remove)}
            aria-label={`Remove ${name()}`}
            onClick={(event) => {
              event.stopPropagation();
              props.onRemove?.(event);
            }}
          >
            ×
          </button>
        </Show>
      </div>
    </div>
  );
}
