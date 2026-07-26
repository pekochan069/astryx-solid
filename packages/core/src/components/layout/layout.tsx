import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createContext, createMemo, omit, Show, useContext } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";
import type { SpacingStep } from "../../types/spacing-steps.types";

import {
  containerPaddingBlockEndVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingInlineVarStyles,
  layoutPaddingOuterXVarStyles,
  layoutPaddingOuterYVarStyles,
  paddingStyles,
} from "../../layout/padding.stylex";
import { stylexProps } from "../../stylex";
import { colorVars, spacingVars } from "../../theme/tokens.stylex";
import { size } from "../../utils/size";
import { themeProps } from "../../utils/theme-props";

export type LayoutHeight = "fill" | "auto";
export type LayoutArea = "header" | "footer" | "content" | "start" | "end" | null;
export interface LayoutSlots {
  readonly hasHeader: boolean;
  readonly hasFooter: boolean;
  readonly hasStart: boolean;
  readonly hasEnd: boolean;
}
export interface LayoutDividerContextValue {
  readonly defaultHasDividers: boolean;
}
export const LayoutAreaContext = createContext<LayoutArea>(null);
export const LayoutSlotsContext = createContext<LayoutSlots>({
  hasHeader: false,
  hasFooter: false,
  hasStart: false,
  hasEnd: false,
});
export const LayoutDividerContext = createContext<LayoutDividerContextValue | null>(null);

export interface LayoutProps extends Omit<BaseProps<HTMLDivElement>, "content"> {
  content?: JSX.Element;
  contentWidth?: SizeValue;
  end?: JSX.Element;
  footer?: JSX.Element;
  header?: JSX.Element;
  height?: LayoutHeight;
  padding?: SpacingStep;
  start?: JSX.Element;
  defaultHasDividers?: boolean;
  children?: JSX.Element;
}

const styles = stylex.create({
  outer: {
    marginInlineStart: "calc(-1 * var(--container-padding-inline-start, 0px))",
    marginInlineEnd: "calc(-1 * var(--container-padding-inline-end, 0px))",
    marginBlockStart: "calc(-1 * var(--container-padding-block-start, 0px))",
    marginBlockEnd: "calc(-1 * var(--container-padding-block-end, 0px))",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    "--container-padding-inline-start": "0px",
    "--container-padding-inline-end": "0px",
    "--container-padding-block-start": "0px",
    "--container-padding-block-end": "0px",
  },
  fill: {
    height:
      "calc(100% + var(--container-padding-block-start, 0px) + var(--container-padding-block-end, 0px))",
    maxHeight: "var(--container-max-height, none)",
  },
  auto: { minHeight: "100%" },
  middle: { display: "flex", flex: 1, minHeight: 0 },
  content: { flex: 1, minWidth: 0, minHeight: 0 },
  constrained: (width: string) => ({ width: "100%", maxWidth: width, marginInline: "auto" }),
});

/** Page shell with explicit header, panel, content, and footer slots. */
export function Layout(props: LayoutProps) {
  const height = () => props.height ?? "fill";
  const content = () => props.content ?? props.children;
  const rest = omit(
    props,
    "content",
    "contentWidth",
    "end",
    "footer",
    "header",
    "height",
    "padding",
    "start",
    "defaultHasDividers",
    "xstyle",
    "class",
    "style",
    "children",
  );
  const root = createMemo(() =>
    stylexProps(styles.outer, height() === "fill" ? styles.fill : styles.auto, props.xstyle),
  );
  const inner = createMemo(() =>
    stylexProps(
      styles.inner,
      height() === "fill" ? styles.fill : styles.auto,
      props.padding != null && layoutPaddingOuterXVarStyles[props.padding],
      props.padding != null && layoutPaddingOuterYVarStyles[props.padding],
    ),
  );
  const middle = createMemo(() =>
    stylexProps(
      styles.middle,
      props.contentWidth != null && styles.constrained(size(props.contentWidth)),
    ),
  );
  const slots: LayoutSlots = {
    get hasHeader() {
      return props.header != null;
    },
    get hasFooter() {
      return props.footer != null;
    },
    get hasStart() {
      return props.start != null;
    },
    get hasEnd() {
      return props.end != null;
    },
  };

  const Tree = () => (
    <LayoutSlotsContext value={slots}>
      <div
        {...rest}
        {...themeProps("layout", { height: height() })}
        class={[themeProps("layout", { height: height() }).class, root().class, props.class]}
        style={{ ...root().style, ...props.style }}
        data-style-src={root()["data-style-src"]}
      >
        <div {...inner()}>
          <Area area="header">{props.header}</Area>
          <div {...middle()}>
            <Area area="start">{props.start}</Area>
            <div {...stylexProps(styles.content)}>
              <Area area="content">{content()}</Area>
            </div>
            <Area area="end">{props.end}</Area>
          </div>
          <Area area="footer">{props.footer}</Area>
        </div>
      </div>
    </LayoutSlotsContext>
  );

  return (
    <Show when={props.defaultHasDividers != null} fallback={<Tree />}>
      <LayoutDividerContext
        value={{
          get defaultHasDividers() {
            return props.defaultHasDividers ?? false;
          },
        }}
      >
        <Tree />
      </LayoutDividerContext>
    </Show>
  );
}

function Area(props: { area: Exclude<LayoutArea, null>; children: JSX.Element }) {
  return props.children == null ? null : (
    <LayoutAreaContext value={props.area}>{props.children}</LayoutAreaContext>
  );
}

export interface LayoutContentProps extends BaseProps<HTMLDivElement> {
  padding?: SpacingStep;
  isScrollable?: boolean;
  label?: string;
  children?: JSX.Element;
}
export interface LayoutPanelResizable {
  readonly _size?: SizeValue;
}
export interface LayoutPanelProps extends LayoutContentProps {
  width?: SizeValue;
  hasDivider?: boolean;
  resizable?: LayoutPanelResizable;
}
export interface LayoutBarProps extends BaseProps<HTMLDivElement> {
  hasDivider?: boolean;
  height?: SizeValue;
  padding?: SpacingStep;
  label?: string;
  children?: JSX.Element;
}
export type LayoutHeaderProps = LayoutBarProps;
export type LayoutFooterProps = LayoutBarProps;

const areaStyles = stylex.create({
  area: {
    boxSizing: "border-box",
    minHeight: 0,
    overflow: "clip",
    paddingInline: `var(--layout-padding-inner-x, ${spacingVars["--spacing-4"]})`,
    paddingBlock: `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
  },
  scrollable: { overflow: "auto" },
  fullBleed: { paddingInline: 0, paddingBlock: 0 },
  outerInlineStart: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  outerInlineEnd: {
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  outerBlockStart: {
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
  },
  outerBlockEnd: {
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
  },
  panel: { flexShrink: 0 },
  collapseStart: {
    marginInlineStart: `calc(-1 * var(--layout-padding-inner-x, ${spacingVars["--spacing-4"]}))`,
  },
  collapseEnd: {
    marginInlineEnd: `calc(-1 * var(--layout-padding-inner-x, ${spacingVars["--spacing-4"]}))`,
  },
  startDivider: {
    borderInlineEndWidth: 1,
    borderInlineEndStyle: "solid",
    borderInlineEndColor: colorVars["--color-border"],
  },
  endDivider: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: colorVars["--color-border"],
  },
  bar: { flexShrink: 0 },
  headerDivider: {
    borderBlockEndWidth: 1,
    borderBlockEndStyle: "solid",
    borderBlockEndColor: colorVars["--color-border"],
  },
  footerDivider: {
    borderBlockStartWidth: 1,
    borderBlockStartStyle: "solid",
    borderBlockStartColor: colorVars["--color-border"],
  },
});

/** Scrollable primary content region. */
export function LayoutContent(props: LayoutContentProps) {
  const slots = useContext(LayoutSlotsContext);

  return (
    <LayoutAreaComponent
      component="layout-content"
      outerInlineStart={!slots.hasStart}
      outerInlineEnd={!slots.hasEnd}
      outerBlockStart={!slots.hasHeader}
      outerBlockEnd={!slots.hasFooter}
      {...props}
    />
  );
}
/** Sidebar region; divider side follows its Layout slot. */
export function LayoutPanel(props: LayoutPanelProps) {
  const rest = omit(props, "resizable", "width");
  const area = useContext(LayoutAreaContext);
  const slots = useContext(LayoutSlotsContext);

  return (
    <LayoutAreaComponent
      {...rest}
      component="layout-panel"
      width={props.resizable?._size ?? props.width}
      hasDivider={props.hasDivider}
      isStartPanel={area === "start"}
      isEndPanel={area === "end"}
      outerInlineStart={area === "start"}
      outerInlineEnd={area === "end"}
      outerBlockStart={!slots.hasHeader}
      outerBlockEnd={!slots.hasFooter}
    />
  );
}
/** Header region with optional bottom divider. */
export function LayoutHeader(props: LayoutHeaderProps) {
  return <LayoutBar component="layout-header" divider={areaStyles.headerDivider} {...props} />;
}
/** Footer region with optional top divider. */
export function LayoutFooter(props: LayoutFooterProps) {
  return <LayoutBar component="layout-footer" divider={areaStyles.footerDivider} {...props} />;
}

function LayoutAreaComponent(
  props: LayoutContentProps & {
    component: string;
    width?: SizeValue;
    hasDivider?: boolean;
    isStartPanel?: boolean;
    isEndPanel?: boolean;
    outerInlineStart?: boolean;
    outerInlineEnd?: boolean;
    outerBlockStart?: boolean;
    outerBlockEnd?: boolean;
  },
) {
  const rest = omit(
    props,
    "component",
    "padding",
    "isScrollable",
    "label",
    "role",
    "width",
    "hasDivider",
    "isStartPanel",
    "isEndPanel",
    "outerInlineStart",
    "outerInlineEnd",
    "outerBlockStart",
    "outerBlockEnd",
    "xstyle",
    "class",
    "style",
    "children",
  );

  const theme = createMemo(() => themeProps(props.component));
  const style = createMemo(() =>
    stylexProps(
      areaStyles.area,
      props.width != null && areaStyles.panel,
      props.isScrollable !== false && areaStyles.scrollable,
      props.padding === 0 && areaStyles.fullBleed,
      props.padding == null && props.outerInlineStart && areaStyles.outerInlineStart,
      props.padding == null && props.outerInlineEnd && areaStyles.outerInlineEnd,
      props.padding == null && props.outerBlockStart && areaStyles.outerBlockStart,
      props.padding == null && props.outerBlockEnd && areaStyles.outerBlockEnd,
      props.padding != null && paddingStyles[props.padding],
      props.padding != null && containerPaddingInlineVarStyles[props.padding],
      props.padding != null && containerPaddingBlockStartVarStyles[props.padding],
      props.padding != null && containerPaddingBlockEndVarStyles[props.padding],
      props.hasDivider && props.isStartPanel && areaStyles.startDivider,
      props.hasDivider && props.isEndPanel && areaStyles.endDivider,
      !props.hasDivider && props.padding == null && props.isStartPanel && areaStyles.collapseEnd,
      !props.hasDivider && props.padding == null && props.isEndPanel && areaStyles.collapseStart,
      props.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      role={props.role}
      aria-label={props.label}
      class={[theme().class, style().class, props.class]}
      style={{
        ...style().style,
        ...(props.width != null && { width: size(props.width) }),
        ...props.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
    </div>
  );
}

function LayoutBar(
  props: LayoutBarProps & {
    component: string;
    divider: typeof areaStyles.headerDivider | typeof areaStyles.footerDivider;
  },
) {
  const rest = omit(
    props,
    "component",
    "divider",
    "hasDivider",
    "height",
    "padding",
    "label",
    "role",
    "xstyle",
    "class",
    "style",
    "children",
  );

  const inherited = useContext(LayoutDividerContext);
  const hasDivider = () => props.hasDivider ?? inherited?.defaultHasDividers ?? false;

  const theme = createMemo(() => themeProps(props.component));
  const style = createMemo(() =>
    stylexProps(
      areaStyles.bar,
      hasDivider() && props.divider,
      props.padding === 0 && areaStyles.fullBleed,
      props.padding != null && paddingStyles[props.padding],
      props.xstyle,
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      role={props.role}
      aria-label={props.label}
      data-divider={hasDivider() || undefined}
      class={[theme().class, style().class, props.class]}
      style={{
        ...style().style,
        ...(props.height != null && { height: size(props.height) }),
        ...props.style,
      }}
      data-style-src={style()["data-style-src"]}
    >
      {props.children}
    </div>
  );
}
