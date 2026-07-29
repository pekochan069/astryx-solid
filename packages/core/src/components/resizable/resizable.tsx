import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createEffect, createMemo, createSignal, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";

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
import { useResizeHandleInteractions } from "./use-resize-handle-interactions";

const STORAGE_PREFIX = "astryx-resizable:";
const DEFAULT_MIN_SIZE = 50;
const DEFAULT_COLLAPSED_SIZE = 40;

export interface ResizableRegionConfig {
  defaultSize?: number | string;
  minSizePx?: number;
  maxSizePx?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  snaps?: number[];
  shrinkOrder?: number;
}

export interface ResizableConfig {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  autoSaveId?: string;
  onWidthChange?: (width: number) => void;
}

export interface UseResizableSingleConfig extends ResizableRegionConfig {
  autoSaveId?: string;
  onSizeChange?: (size: number) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export interface UseResizableMultiConfig {
  direction?: "horizontal" | "vertical";
  regions: Record<string, ResizableRegionConfig>;
  autoSaveId?: string;
}

export interface ResizableProps {
  readonly _size: number;
  readonly _isCollapsed: boolean;
  readonly _minSizePx: number;
  readonly _maxSizePx: number;
  readonly _snaps: number[];
  readonly _collapsedSize: number;
  readonly _collapsible: boolean;
  readonly _direction?: "horizontal" | "vertical";
  readonly _isResizableProps: true;
  _onResizeStart(): void;
  _onResizeMove(delta: number): void;
  _onResizeEnd(): void;
}

export interface ResizableRegion {
  readonly size: number;
  readonly isCollapsed: boolean;
  collapse(): void;
  expand(): void;
  resize(size: number): void;
  readonly props: ResizableProps;
}

function clampSize(size: number, min: number, max: number, snaps: number[]) {
  const clamped = Math.min(max, Math.max(min, size));
  if (snaps.length === 0) return clamped;
  const snapped = snaps.reduce((nearest, point) =>
    Math.abs(point - clamped) < Math.abs(nearest - clamped) ? point : nearest,
  );
  return Math.min(max, Math.max(min, snapped));
}

function defaultSize(value: number | string | undefined, viewportWidth = 1200) {
  if (typeof value === "number") return value;
  if (value?.endsWith("%"))
    return Math.round(((Number.parseFloat(value) || 0) / 100) * viewportWidth);
  return 250;
}

function readSize(key: string) {
  if (typeof window === "undefined") return undefined;
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(`${STORAGE_PREFIX}${key}`) ?? "null",
    );
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function saveSize(key: string | undefined, size: number) {
  if (key === undefined || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(size));
  } catch {
    // Storage can be unavailable in private browsing or embedded documents.
  }
}

function restoredSize(
  config: UseResizableSingleConfig,
  key: string | undefined,
  min: number,
  max: number,
  snaps: number[],
) {
  const persisted = key === undefined ? undefined : readSize(key);
  if (persisted === 0 && config.collapsible) return 0;

  const fallback =
    typeof window !== "undefined" && typeof config.defaultSize === "string"
      ? defaultSize(config.defaultSize, window.innerWidth)
      : undefined;
  const value = persisted ?? fallback;

  return value === undefined ? undefined : clampSize(value, min, max, snaps);
}

function createResizableProps(
  config: UseResizableSingleConfig,
  direction: "horizontal" | "vertical" | undefined,
  min: number,
  max: number,
  snaps: number[],
  size: () => number,
  collapsed: () => boolean,
  collapse: () => void,
  commit: (next: number) => void,
): ResizableProps {
  let dragStart = size();

  return {
    get _size() {
      return collapsed() ? 0 : size();
    },
    get _isCollapsed() {
      return collapsed();
    },
    _minSizePx: min,
    _maxSizePx: max,
    _snaps: snaps,
    _collapsedSize: config.collapsedSize ?? DEFAULT_COLLAPSED_SIZE,
    _collapsible: config.collapsible ?? false,
    _direction: direction,
    _isResizableProps: true,
    _onResizeStart() {
      dragStart = collapsed() ? 0 : size();
    },
    _onResizeMove(delta: number) {
      const next = dragStart + delta;
      if (config.collapsible && next < (config.collapsedSize ?? DEFAULT_COLLAPSED_SIZE)) collapse();
      else commit(next);
    },
    _onResizeEnd() {},
  };
}

function createResizableRegion(
  config: UseResizableSingleConfig,
  direction?: "horizontal" | "vertical",
): ResizableRegion {
  const min = config.minSizePx ?? DEFAULT_MIN_SIZE;
  const max = config.maxSizePx ?? Infinity;
  const snaps = config.snaps ?? [];
  const initial = clampSize(defaultSize(config.defaultSize), min, max, snaps);

  const [size, setSize] = createSignal(initial);
  const [collapsed, setCollapsed] = createSignal(false);

  let previousSize = initial;
  let collapsedState = false;

  const commit = (next: number) => {
    const value = clampSize(next, min, max, snaps);
    const wasCollapsed = collapsedState;
    collapsedState = false;
    setCollapsed(false);
    setSize(value);
    if (wasCollapsed) config.onCollapseChange?.(false);
    config.onSizeChange?.(value);
    saveSize(config.autoSaveId, value);
  };

  const collapse = () => {
    if (!config.collapsible || collapsedState) return;
    previousSize = size();
    collapsedState = true;
    setCollapsed(true);
    setSize(0);
    config.onCollapseChange?.(true);
    config.onSizeChange?.(0);
    saveSize(config.autoSaveId, 0);
  };

  const expand = () => commit(previousSize || initial);
  const resize = (next: number) => commit(next);
  const isCollapsed = () => {
    collapsed();
    return collapsedState;
  };

  createEffect(
    () => config.autoSaveId,
    (key) => {
      const restored = restoredSize(config, key, min, max, snaps);
      if (restored === undefined) return;

      if (restored === 0 && config.collapsible) {
        collapsedState = true;
        setCollapsed(true);
        setSize(0);
        return;
      }

      previousSize = restored;
      setSize(restored);
    },
  );

  return {
    get size() {
      return isCollapsed() ? 0 : size();
    },
    get isCollapsed() {
      return isCollapsed();
    },
    collapse,
    expand,
    resize,
    get props() {
      return createResizableProps(
        config,
        direction,
        min,
        max,
        snaps,
        size,
        isCollapsed,
        collapse,
        commit,
      );
    },
  };
}

export function useResizable(config: UseResizableSingleConfig): ResizableRegion;

export function useResizable(config: UseResizableMultiConfig): Record<string, ResizableRegion>;

export function useResizable(
  config: UseResizableSingleConfig | UseResizableMultiConfig,
): ResizableRegion | Record<string, ResizableRegion> {
  if (!("regions" in config)) return createResizableRegion(config);

  return Object.fromEntries(
    Object.entries(config.regions).map(([name, region]) => [
      name,
      createResizableRegion(
        {
          ...region,
          autoSaveId: config.autoSaveId === undefined ? undefined : `${config.autoSaveId}:${name}`,
        },
        config.direction,
      ),
    ]),
  );
}

export interface ResizeHandleProps extends Omit<BaseProps<HTMLDivElement>, "onKeyDown"> {
  direction?: "horizontal" | "vertical";
  position?: "inline" | "overlay";
  onKeyDown?: (event: KeyboardEvent) => void;
  isReversed?: boolean;
  isDisabled?: boolean;
  hasDivider?: boolean;
  isAlwaysVisible?: boolean;
  pillPlacement?: "start" | "end" | "center" | "auto";
  label?: string;
  resizable?: ResizableProps;
  children?: JSX.Element;
}

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: colorVars["--color-border"],
    transitionProperty: "background-color",
    transitionDuration: durationVars["--duration-fast"],
    transitionTimingFunction: easeVars["--ease-standard"],
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colorVars["--color-accent"]}`,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": spacingVars["--spacing-0-5"],
    },
  },
  horizontal: { width: 1, height: "100%", cursor: "col-resize" },
  vertical: { height: 1, width: "100%", cursor: "row-resize" },
  overlay: { position: "absolute", zIndex: 2, backgroundColor: "transparent" },
  overlayHorizontal: { insetInlineEnd: 0, top: 0, bottom: 0, width: spacingVars["--spacing-4"] },
  overlayVertical: { insetBlockEnd: 0, left: 0, right: 0, height: spacingVars["--spacing-4"] },
  invisibleHorizontal: { backgroundColor: "transparent", width: 0 },
  invisibleVertical: { backgroundColor: "transparent", height: 0 },
  disabled: { cursor: "default", pointerEvents: "none" },
  hitArea: { position: "absolute", zIndex: 1, touchAction: "none", userSelect: "none" },
  hitAreaHorizontal: {
    width: spacingVars["--spacing-4"],
    top: 0,
    bottom: 0,
    left: "50%",
  },
  hitAreaVertical: {
    height: spacingVars["--spacing-4"],
    left: 0,
    right: 0,
    top: "50%",
  },
  pill: {
    position: "absolute",
    zIndex: 2,
    pointerEvents: "none",
    borderRadius: radiusVars["--radius-full"],
    backgroundColor: colorVars["--color-border"],
    transitionProperty: "opacity, background-color, transform",
    transitionDuration: durationVars["--duration-fast"],
    transitionTimingFunction: easeVars["--ease-standard"],
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  pillHorizontal: { width: 3, height: spacingVars["--spacing-8"] },
  pillVertical: { width: spacingVars["--spacing-8"], height: 3 },
  pillHidden: { opacity: 0 },
  pillVisible: { opacity: 1 },
  pillHover: { opacity: 1, backgroundColor: colorVars["--color-border"] },
  pillActive: { opacity: 1, backgroundColor: colorVars["--color-border-emphasized"] },
});

const dynamicStyles = stylex.create({
  hitAreaBiasX: (percent: string) => ({ transform: `translateX(-${percent})` }),
  hitAreaBiasY: (percent: string) => ({ transform: `translateY(-${percent})` }),
  pillOffsetX: (direction: number) => ({
    left: 0,
    transform: `translate(calc(${direction} * (100% + ${spacingVars["--spacing-1"]})), -50%)`,
  }),
  pillOffsetY: (direction: number) => ({
    top: 0,
    transform: `translate(-50%, calc(${direction} * (100% + ${spacingVars["--spacing-1"]})))`,
  }),
});

const pillTheme = themeProps("resize-handle-pill");

function resolveEffectiveSide(
  placement: NonNullable<ResizeHandleProps["pillPlacement"]>,
  isReversed: boolean,
  isCollapsed: boolean,
): "start" | "end" | "center" {
  if (placement !== "auto") return placement;

  const side = isReversed ? "end" : "start";
  return isCollapsed ? (side === "start" ? "end" : "start") : side;
}

function hitAreaBias(side: "start" | "end" | "center") {
  return side === "center" ? "50%" : side === "start" ? "66.67%" : "33.33%";
}

function resizeHandleRest(props: ResizeHandleProps) {
  return omit(
    props,
    "direction",
    "position",
    "isReversed",
    "isDisabled",
    "hasDivider",
    "isAlwaysVisible",
    "pillPlacement",
    "label",
    "resizable",
    "children",
    "xstyle",
    "class",
    "style",
    "onKeyDown",
    "ref",
  );
}

export function ResizeHandle(props: ResizeHandleProps) {
  const rest = resizeHandleRest(props);

  let element: HTMLDivElement | undefined;
  const setElement = (next: HTMLDivElement) => {
    element = next;
    setElementRef(props.ref, next);
  };

  const horizontal = () =>
    (props.direction ?? props.resizable?._direction ?? "horizontal") === "horizontal";
  const multiplier = () =>
    (props.isReversed ? -1 : 1) *
    (horizontal() && element !== undefined && getComputedStyle(element).direction === "rtl"
      ? -1
      : 1);
  const side = () =>
    resolveEffectiveSide(
      props.pillPlacement ?? "auto",
      props.isReversed ?? false,
      props.resizable?._isCollapsed ?? false,
    );
  const interactions = useResizeHandleInteractions({ props, horizontal, multiplier });
  const pillStyle = () =>
    stylexProps(
      styles.pill,
      horizontal() ? styles.pillHorizontal : styles.pillVertical,
      side() !== "center" &&
        (horizontal()
          ? dynamicStyles.pillOffsetX(side() === "start" ? -1 : 1)
          : dynamicStyles.pillOffsetY(side() === "start" ? -1 : 1)),
      props.isAlwaysVisible !== false ? styles.pillVisible : styles.pillHidden,
      interactions.interacting() && !interactions.dragging() && styles.pillHover,
      interactions.dragging() && styles.pillActive,
    );

  const hitAreaStyle = () =>
    stylexProps(
      styles.hitArea,
      horizontal() ? styles.hitAreaHorizontal : styles.hitAreaVertical,
      horizontal()
        ? dynamicStyles.hitAreaBiasX(hitAreaBias(side()))
        : dynamicStyles.hitAreaBiasY(hitAreaBias(side())),
      props.isDisabled && styles.disabled,
    );

  const theme = createMemo(() => themeProps("resize-handle"));
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      props.position === "overlay"
        ? styles.overlay
        : horizontal()
          ? styles.horizontal
          : styles.vertical,
      props.position === "overlay" &&
        (horizontal() ? styles.overlayHorizontal : styles.overlayVertical),
      !props.hasDivider &&
        props.position !== "overlay" &&
        (horizontal() ? styles.invisibleHorizontal : styles.invisibleVertical),
      props.isDisabled && styles.disabled,
      props.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      ref={setElement}
      role="separator"
      aria-orientation={horizontal() ? "vertical" : "horizontal"}
      aria-valuenow={props.resizable?._size}
      aria-valuemin={props.resizable?._minSizePx}
      aria-valuemax={
        Number.isFinite(props.resizable?._maxSizePx) ? props.resizable?._maxSizePx : undefined
      }
      aria-label={props.label ?? "Resize handle"}
      aria-disabled={props.isDisabled ? "true" : undefined}
      tabindex={props.isDisabled ? "-1" : "0"}
      data-resizing={interactions.dragging() || undefined}
      onPointerDown={interactions.onPointerDown}
      onFocus={() => interactions.setInteracting(true)}
      onBlur={() => interactions.setInteracting(false)}
      onDblClick={() => {
        if (props.resizable?._collapsible && !props.isDisabled) {
          interactions.toggleResizable(props.resizable);
        }
      }}
      onKeyDown={interactions.onKeyDown}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div
        {...hitAreaStyle()}
        onPointerDown={interactions.onPointerDown}
        onPointerEnter={() => interactions.setInteracting(true)}
        onPointerLeave={() => !interactions.dragging() && interactions.setInteracting(false)}
      />
      <Show
        when={props.children != null}
        fallback={<div {...pillStyle()} class={[pillTheme.class, pillStyle().class]} />}
      >
        {props.children}
      </Show>
    </div>
  );
}
