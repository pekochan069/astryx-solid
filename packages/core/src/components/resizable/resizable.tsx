import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createEffect, createMemo, createSignal, omit, onCleanup } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, radiusVars, spacingVars } from "../../theme/tokens.stylex";
import { setElementRef } from "../../utils/set-element-ref";
import { themeProps } from "../../utils/theme-props";

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

export interface ResizableGroup {
  readonly regions: Record<string, ResizableRegion>;
  resizeToFit(size: number): void;
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

function createResizableGroup(config: UseResizableMultiConfig): ResizableGroup {
  const entries = Object.entries(config.regions);
  const regions = Object.fromEntries(
    entries.map(([name, region]) => [
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

  return {
    regions,
    resizeToFit(availableSize: number) {
      if (!Number.isFinite(availableSize)) return;

      let overflow =
        Object.values(regions).reduce((total, region) => total + region.size, 0) -
        Math.max(0, availableSize);
      const ordered = entries.toSorted(
        ([, first], [, second]) =>
          (first.shrinkOrder ?? Infinity) - (second.shrinkOrder ?? Infinity),
      );

      for (const [name, regionConfig] of ordered) {
        if (overflow <= 0) break;

        const region = regions[name];
        if (region.isCollapsed) continue;

        const previousSize = region.size;
        const nextSize = clampSize(
          previousSize - overflow,
          regionConfig.minSizePx ?? DEFAULT_MIN_SIZE,
          regionConfig.maxSizePx ?? Infinity,
          regionConfig.snaps ?? [],
        );
        region.resize(nextSize);
        overflow -= Math.max(0, previousSize - nextSize);
      }
    },
  };
}

export function useResizable(config: UseResizableSingleConfig): ResizableRegion;

export function useResizable(config: UseResizableMultiConfig): ResizableGroup;

export function useResizable(
  config: UseResizableSingleConfig | UseResizableMultiConfig,
): ResizableRegion | ResizableGroup {
  return "regions" in config ? createResizableGroup(config) : createResizableRegion(config);
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
  root: { position: "relative", flexShrink: 0, backgroundColor: colorVars["--color-border"] },
  horizontal: { width: 1, height: "100%", cursor: "col-resize" },
  vertical: { height: 1, width: "100%", cursor: "row-resize" },
  overlay: { position: "absolute", zIndex: 2, backgroundColor: "transparent" },
  overlayHorizontal: { right: 0, top: 0, bottom: 0, width: spacingVars["--spacing-4"] },
  overlayVertical: { bottom: 0, left: 0, right: 0, height: spacingVars["--spacing-4"] },
  invisible: { backgroundColor: "transparent" },
  disabled: { cursor: "default", pointerEvents: "none" },
  hitArea: { position: "absolute", zIndex: 1, touchAction: "none", userSelect: "none" },
  hitAreaHorizontal: {
    width: spacingVars["--spacing-4"],
    top: 0,
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
  },
  hitAreaVertical: {
    height: spacingVars["--spacing-4"],
    left: 0,
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
  },
  pill: {
    position: "absolute",
    zIndex: 2,
    pointerEvents: "none",
    borderRadius: radiusVars["--radius-full"],
    backgroundColor: colorVars["--color-border"],
  },
  pillHorizontal: {
    width: 3,
    height: spacingVars["--spacing-8"],
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  pillVertical: {
    width: spacingVars["--spacing-8"],
    height: 3,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  pillStartHorizontal: { left: 0, transform: "translate(-100%, -50%)" },
  pillEndHorizontal: { left: "100%", transform: "translate(0, -50%)" },
  pillStartVertical: { top: 0, transform: "translate(-50%, -100%)" },
  pillEndVertical: { top: "100%", transform: "translate(-50%, 0)" },
  pillHidden: { opacity: 0 },
});

const pillTheme = themeProps("resize-handle-pill");

function pillSide(props: ResizeHandleProps) {
  if (props.pillPlacement && props.pillPlacement !== "auto") return props.pillPlacement;

  const side = props.isReversed ? "end" : "start";
  return props.resizable?._isCollapsed ? (side === "start" ? "end" : "start") : side;
}

function resizeBy(resizable: ResizableProps, delta: number) {
  resizable._onResizeStart();
  resizable._onResizeMove(delta);
  resizable._onResizeEnd();
}

function toggleResizable(resizable: ResizableProps) {
  resizeBy(resizable, resizable._isCollapsed ? resizable._minSizePx : -resizable._size);
}

function resizeFromKey(
  event: KeyboardEvent,
  resizable: ResizableProps,
  horizontal: boolean,
  multiplier: number,
) {
  const step = event.shiftKey ? 50 : 10;
  const positive = horizontal ? event.key === "ArrowRight" : event.key === "ArrowDown";
  const negative = horizontal ? event.key === "ArrowLeft" : event.key === "ArrowUp";

  if (positive || negative) {
    event.preventDefault();
    resizeBy(resizable, (positive ? step : -step) * multiplier);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    resizeBy(resizable, resizable._minSizePx - resizable._size);
    return;
  }

  if (event.key === "End" && Number.isFinite(resizable._maxSizePx)) {
    event.preventDefault();
    resizeBy(resizable, resizable._maxSizePx - resizable._size);
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && resizable._collapsible) {
    event.preventDefault();
    toggleResizable(resizable);
  }
}

function setResizeHandleElement(ref: JSX.Ref<HTMLDivElement> | undefined, element: HTMLDivElement) {
  setElementRef(ref, element);
  return element;
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
  const [dragging, setDragging] = createSignal(false);
  const [interacting, setInteracting] = createSignal(false);

  let element: HTMLDivElement | undefined;
  const setElement = (next: HTMLDivElement) => (element = setResizeHandleElement(props.ref, next));

  const horizontal = () =>
    (props.direction ?? props.resizable?._direction ?? "horizontal") === "horizontal";
  const multiplier = () =>
    (props.isReversed ? -1 : 1) *
    (horizontal() && element !== undefined && getComputedStyle(element).direction === "rtl"
      ? -1
      : 1);

  let cancelDrag = () => {};
  const finish = (complete: boolean) => {
    cancelDrag();
    setDragging(false);

    if (typeof document !== "undefined") {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    if (complete) props.resizable?._onResizeEnd();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (props.isDisabled || !props.resizable) return;

    event.preventDefault();

    const start = horizontal() ? event.clientX : event.clientY;
    const sign = multiplier();

    setDragging(true);
    props.resizable._onResizeStart();
    document.body.style.cursor = horizontal() ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";

    const move = (next: PointerEvent) =>
      props.resizable?._onResizeMove(((horizontal() ? next.clientX : next.clientY) - start) * sign);
    const up = () => finish(true);
    const cancel = () => finish(false);

    cancelDrag = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      cancelDrag = () => {};
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    props.onKeyDown?.(event);

    if (event.defaultPrevented || props.isDisabled || !props.resizable) return;

    resizeFromKey(event, props.resizable, horizontal(), multiplier());
  };

  onCleanup(() => finish(false));

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
      !props.hasDivider && props.position !== "overlay" && styles.invisible,
      props.isDisabled && styles.disabled,
      props.xstyle,
    ),
  );

  const side = () => pillSide(props);
  const pillStyle = () =>
    stylexProps(
      styles.pill,
      horizontal() ? styles.pillHorizontal : styles.pillVertical,
      side() === "start" && (horizontal() ? styles.pillStartHorizontal : styles.pillStartVertical),
      side() === "end" && (horizontal() ? styles.pillEndHorizontal : styles.pillEndVertical),
      props.isAlwaysVisible === false && !interacting() && !dragging() && styles.pillHidden,
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
      data-resizing={dragging() || undefined}
      onPointerDown={onPointerDown}
      onPointerEnter={() => setInteracting(true)}
      onPointerLeave={() => !dragging() && setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={() => setInteracting(false)}
      onDblClick={() => {
        if (props.resizable?._collapsible && !props.isDisabled) toggleResizable(props.resizable);
      }}
      onKeyDown={onKeyDown}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div
        {...stylexProps(
          styles.hitArea,
          horizontal() ? styles.hitAreaHorizontal : styles.hitAreaVertical,
        )}
      />
      <div {...pillStyle()} class={[pillTheme.class, pillStyle().class]}>
        {props.children}
      </div>
    </div>
  );
}
