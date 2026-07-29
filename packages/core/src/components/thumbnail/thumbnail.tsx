import * as stylex from "@stylexjs/stylex";
import { createEffect, createMemo, createSignal, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

import { useTranslator } from "../../i18n";
import { stylexProps } from "../../stylex";
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  spacingVars,
} from "../../theme/tokens.stylex";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";
import { Spinner } from "../spinner/spinner";
import { thumbnailScope } from "./thumbnail.markers.stylex";

export interface ThumbnailProps extends BaseProps<HTMLDivElement> {
  src?: string;
  alt?: string;
  label?: string;
  onRemove?: (event: MouseEvent) => void;
  onClick?: (event: MouseEvent) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  showRemoveOn?: "always" | "hover";
}

const styles = stylex.create({
  root: {
    position: "relative",
    display: "inline-flex",
    flexDirection: "column",
    width: 64,
    flexShrink: 0,
    isolation: "isolate",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "1",
    borderRadius: radiusVars["--radius-element"],
    overflow: "hidden",
    backgroundColor: colorVars["--color-neutral"],
  },
  image: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  insetBorder: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    boxShadow: `inset 0 0 0 1px ${colorVars["--color-border"]}`,
    pointerEvents: "none",
  },
  placeholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    color: colorVars["--color-icon-secondary"],
  },
  interactive: {
    cursor: "pointer",
    outline: {
      default: null,
      ":has(:focus-visible)": `2px solid ${colorVars["--color-accent"]}`,
    },
    outlineOffset: {
      default: "0",
      ":has(:focus-visible)": "2px",
    },
  },
  overlay: {
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      transitionProperty: "background-color",
      transitionDuration: durationVars["--duration-fast"],
      transitionTimingFunction: easeVars["--ease-standard"],
      backgroundColor: "transparent",
    },
    ":active::after": {
      backgroundColor: colorVars["--color-overlay-pressed"],
    },
  },
  hoverOnPointer: {
    "@media (hover: hover)": {
      ":hover::after": { backgroundColor: colorVars["--color-overlay-hover"] },
    },
  },
  interactiveButton: {
    all: "unset",
    cursor: "pointer",
    display: "block",
    width: "100%",
    height: "100%",
    borderRadius: radiusVars["--radius-element"],
    overflow: "hidden",
  },
  removeSlot: {
    position: "absolute",
    top: spacingVars["--spacing-1"],
    insetInlineEnd: spacingVars["--spacing-1"],
    zIndex: 1,
    lineHeight: 0,
  },
  removeButtonOverrides: {
    "--_button-radius": `calc(${radiusVars["--radius-element"]} - ${spacingVars["--spacing-1"]})`,
    height: 20,
    minWidth: 20,
    backgroundColor: colorVars["--color-overlay"],
    color: colorVars["--color-on-dark"],
  },
  disabled: { opacity: 0.5, pointerEvents: "none" },
  uploadOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorVars["--color-overlay"],
    borderRadius: "inherit",
    zIndex: 1,
    lineHeight: 0,
  },
  removeOnHover: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover", thumbnailScope)]: {
        "@media (hover: hover)": 1,
      },
      [stylex.when.ancestor(":focus-within", thumbnailScope)]: 1,
      "@media (any-pointer: coarse)": 1,
    },
    transitionProperty: "opacity",
    transitionDuration: {
      default: durationVars["--duration-fast"],
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: easeVars["--ease-standard"],
  },
});

function ImagePlaceholder() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-5.5z" />
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
  const showImage = () => props.src != null && props.failedSrc !== props.src;
  const showSkeleton = () => props.isLoading && props.src == null;

  return (
    <Show
      when={showImage()}
      fallback={
        <Show
          when={showSkeleton()}
          fallback={
            <div {...stylexProps(styles.placeholder)}>
              <ImagePlaceholder />
            </div>
          }
        >
          <Skeleton width="100%" height="100%" radius={2} />
        </Show>
      }
    >
      <img
        src={props.src}
        alt={props.alt ?? ""}
        role={props.alt ? undefined : "presentation"}
        aria-hidden={props.alt ? undefined : "true"}
        onError={() => props.setFailedSrc(props.src)}
        {...stylexProps(styles.image)}
      />
    </Show>
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
    "showRemoveOn",
    "xstyle",
    "class",
    "style",
    "ref",
  );

  const t = useTranslator();

  const [failedSrc, setFailedSrc] = createSignal<string>();
  const name = () =>
    props.label && props.alt
      ? `${props.label} — ${props.alt}`
      : (props.label ?? props.alt ?? "thumbnail");
  const interactive = () => props.onClick != null && !props.isDisabled && !props.isLoading;
  const hasRemove = () => props.onRemove != null && !props.isDisabled;
  const hoverReveal = () => hasRemove() && (props.showRemoveOn ?? "hover") === "hover";

  const [warnedUnnamed, setWarnedUnnamed] = createSignal(false);
  function warnUnnamedThumbnail() {
    if (warnedUnnamed()) return;
    if (typeof process !== "undefined" && process.env.NODE_ENV === "production") return;
    setWarnedUnnamed(true);
    console.warn(
      "[Astryx] Thumbnail src is set without alt or label. Pass alt to describe image content, or label to name thumbnail.",
    );
  }
  createEffect(
    () => ({
      src: props.src,
      alt: props.alt,
      label: props.label,
      ariaLabel: props["aria-label"],
      ariaLabelledby: props["aria-labelledby"],
    }),
    ({ src, alt, label, ariaLabel, ariaLabelledby }) => {
      if (
        src != null &&
        !(alt != null || label != null || ariaLabel != null || ariaLabelledby != null)
      ) {
        warnUnnamedThumbnail();
      }
    },
  );

  const theme = createMemo(() => themeProps("thumbnail"));
  const style = createMemo(() =>
    stylexProps(styles.root, props.isDisabled && styles.disabled, props.xstyle),
  );

  const removeLabel = () => t("@astryx.thumbnail.remove", { accessibleName: name() });
  const openLabel = () => t("@astryx.thumbnail.open", { accessibleName: name() });

  return (
    <div
      {...rest}
      {...theme()}
      ref={(element: HTMLDivElement) => setElementRef(props.ref, element)}
      role="group"
      aria-label={props["aria-label"] ?? name()}
      title={props.title ?? props.label}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div
        {...stylexProps(
          styles.imageContainer,
          hoverReveal() && thumbnailScope,
          interactive() && styles.interactive,
          interactive() && styles.overlay,
          interactive() && styles.hoverOnPointer,
        )}
      >
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
            onClick={(event) => props.onClick?.(event)}
            aria-label={openLabel()}
            {...stylexProps(styles.interactiveButton)}
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
        <Show when={props.src != null && failedSrc() !== props.src}>
          <div {...stylexProps(styles.insetBorder)} />
        </Show>
        <Show when={props.isLoading && props.src != null && failedSrc() !== props.src}>
          <div {...stylexProps(styles.uploadOverlay)}>
            <Spinner size="sm" shade="onMedia" />
          </div>
        </Show>
        <Show when={hasRemove()}>
          <div {...stylexProps(styles.removeSlot, hoverReveal() && styles.removeOnHover)}>
            <Button
              label={removeLabel()}
              variant="secondary"
              size="sm"
              isIconOnly
              icon={<Icon icon="close" size="xsm" />}
              xstyle={styles.removeButtonOverrides}
              onClick={(event) => {
                event.stopPropagation();
                props.onRemove?.(event);
              }}
            />
          </div>
        </Show>
      </div>
    </div>
  );
}
