import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createContext, createMemo, merge, omit, Show, useContext } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { SizeValue } from "../../types/size-value.types";
import type { SpacingStep } from "../../types/spacing-steps.types";
import type { ResizableProps } from "../resizable";

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
type LayoutArea = "header" | "footer" | "content" | "start" | "end" | null;

interface LayoutSlots {
  readonly hasHeader: boolean;
  readonly hasFooter: boolean;
  readonly hasStart: boolean;
  readonly hasEnd: boolean;
}
interface LayoutDividerContextValue {
  readonly defaultHasDividers: boolean;
}

const LayoutAreaContext = createContext<LayoutArea>(null);
const LayoutSlotsContext = createContext<LayoutSlots>({
  hasHeader: false,
  hasFooter: false,
  hasStart: false,
  hasEnd: false,
});
const LayoutDividerContext = createContext<LayoutDividerContextValue>({
  defaultHasDividers: false,
});

export interface LayoutProps extends Omit<BaseProps<HTMLDivElement>, "content"> {
  contentWidth?: SizeValue;
  end?: JSX.Element;
  footer?: JSX.Element;
  header?: JSX.Element;
  height?: LayoutHeight;
  padding?: SpacingStep;
  start?: JSX.Element;
  defaultHasDividers?: boolean;
  content?: JSX.Element;
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
  contentWidth: (width: string) => ({ "--layout-content-width": width }),
});

/** Page shell with explicit header, panel, content, and footer slots. */
export function Layout(props: LayoutProps) {
  const merged = merge(
    {
      height: "fill",
    } satisfies LayoutProps,
    props,
  );

  const rest = omit(
    merged,
    "contentWidth",
    "end",
    "footer",
    "header",
    "height",
    "padding",
    "start",
    "defaultHasDividers",
    "content",
    "xstyle",
    "class",
    "style",
    "children",
  );

  const rootStyle = createMemo(() =>
    stylexProps(styles.outer, merged.height === "fill" ? styles.fill : styles.auto, merged.xstyle),
  );
  const innerStyle = createMemo(() =>
    stylexProps(
      styles.inner,
      merged.height === "fill" ? styles.fill : styles.auto,
      merged.padding != null && layoutPaddingOuterXVarStyles[merged.padding],
      merged.padding != null && layoutPaddingOuterYVarStyles[merged.padding],
      merged.contentWidth != null && styles.contentWidth(size(merged.contentWidth)),
    ),
  );
  const middleStyle = createMemo(() =>
    stylexProps(
      styles.middle,
      merged.contentWidth != null && styles.constrained(size(merged.contentWidth)),
    ),
  );

  const theme = createMemo(() => themeProps("layout", { height: merged.height }));

  const inheritedDividers = useContext(LayoutDividerContext);
  const dividerContext: LayoutDividerContextValue = {
    get defaultHasDividers() {
      return merged.defaultHasDividers ?? inheritedDividers.defaultHasDividers;
    },
  };

  const slots: LayoutSlots = {
    get hasHeader() {
      return merged.header != null && merged.header !== false;
    },
    get hasFooter() {
      return merged.footer != null && merged.footer !== false;
    },
    get hasStart() {
      return merged.start != null && merged.start !== false;
    },
    get hasEnd() {
      return merged.end != null && merged.end !== false;
    },
  };

  return (
    <LayoutDividerContext value={dividerContext}>
      <LayoutSlotsContext value={slots}>
        <div
          {...rest}
          {...theme()}
          class={[theme().class, rootStyle().class, merged.class]}
          style={{ ...rootStyle().style, ...merged.style }}
          data-style-src={rootStyle()["data-style-src"]}
        >
          <div {...innerStyle()}>
            <Area area="header">{merged.header}</Area>
            <div {...middleStyle()}>
              <Area area="start">{merged.start}</Area>
              <div {...stylexProps(styles.content)}>
                <Area area="content">{merged.content ?? merged.children}</Area>
              </div>
              <Area area="end">{merged.end}</Area>
            </div>
            <Area area="footer">{merged.footer}</Area>
          </div>
        </div>
      </LayoutSlotsContext>
    </LayoutDividerContext>
  );
}

function Area(props: { area: Exclude<LayoutArea, null>; children: JSX.Element }) {
  return (
    <Show when={props.children != null && props.children !== false}>
      <LayoutAreaContext value={props.area}>{props.children}</LayoutAreaContext>
    </Show>
  );
}

export interface LayoutContentProps extends BaseProps<HTMLDivElement> {
  padding?: SpacingStep;
  isScrollable?: boolean;
  label?: string;
  children?: JSX.Element;
}
export interface LayoutPanelProps extends LayoutContentProps {
  width?: SizeValue;
  hasDivider?: boolean;
  resizable?: ResizableProps;
}

export interface LayoutBaseProps extends BaseProps<HTMLDivElement> {
  hasDivider?: boolean;
  height?: SizeValue;
  padding?: SpacingStep;
  label?: string;
  children?: JSX.Element;
}

export type LayoutHeaderProps = LayoutBaseProps;
export type LayoutFooterProps = LayoutBaseProps;

const areaStyles = stylex.create({
  area: {
    boxSizing: "border-box",
    minHeight: 0,
    overflow: "clip",
    paddingInline: `var(--layout-padding-inner-x, ${spacingVars["--spacing-4"]})`,
    paddingBlock: `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-inline-start": `var(--layout-padding-inner-x, ${spacingVars["--spacing-4"]})`,
    "--container-padding-inline-end": `var(--layout-padding-inner-x, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-start": `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-end": `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
  },
  content: { height: "100%", flex: 1 },
  scrollable: { overflow: "auto" },
  fullBleed: {
    paddingInline: 0,
    paddingBlock: 0,
    "--container-padding-inline-start": "0px",
    "--container-padding-inline-end": "0px",
    "--container-padding-block-start": "0px",
    "--container-padding-block-end": "0px",
  },
  outerInlineStart: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  outerInlineEnd: {
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  contentOuterInlineStart: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
    "--container-padding-inline-start": `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
    "--container-padding-inline-end": `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  contentOuterInlineEnd: {
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  contentOuterBlockStart: {
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-start": `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
  },
  contentOuterBlockEnd: {
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-end": `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
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
  barInner: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "var(--layout-content-width, none)",
    marginInline: "auto",
    paddingInline: `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
    "--container-padding-inline-start": `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
    "--container-padding-inline-end": `var(--layout-padding-outer-x, ${spacingVars["--spacing-4"]})`,
  },
  headerInner: {
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-start": `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-end": `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
  },
  footerInner: {
    paddingBlockStart: `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-start": `var(--layout-padding-inner-y, ${spacingVars["--spacing-4"]})`,
    "--container-padding-block-end": `var(--layout-padding-outer-y, ${spacingVars["--spacing-4"]})`,
  },
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
  const rest = omit(props, "width", "resizable");

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

interface LayoutAreaComponentProps extends LayoutContentProps {
  component: string;
  width?: SizeValue;
  hasDivider?: boolean;
  isStartPanel?: boolean;
  isEndPanel?: boolean;
  outerInlineStart?: boolean;
  outerInlineEnd?: boolean;
  outerBlockStart?: boolean;
  outerBlockEnd?: boolean;
}

function LayoutAreaComponent(props: LayoutAreaComponentProps) {
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
      props.component === "layout-content" && areaStyles.content,
      props.component !== "layout-content" && areaStyles.panel,
      props.isScrollable !== false && areaStyles.scrollable,
      props.padding === 0 && areaStyles.fullBleed,
      props.padding == null &&
        props.component === "layout-content" &&
        props.outerInlineStart &&
        areaStyles.contentOuterInlineStart,
      props.padding == null &&
        props.component === "layout-content" &&
        props.outerInlineEnd &&
        areaStyles.contentOuterInlineEnd,
      props.padding == null &&
        props.component === "layout-content" &&
        props.outerBlockStart &&
        areaStyles.contentOuterBlockStart,
      props.padding == null &&
        props.component === "layout-content" &&
        props.outerBlockEnd &&
        areaStyles.contentOuterBlockEnd,
      props.padding == null &&
        props.component !== "layout-content" &&
        props.outerInlineStart &&
        areaStyles.outerInlineStart,
      props.padding == null &&
        props.component !== "layout-content" &&
        props.outerInlineEnd &&
        areaStyles.outerInlineEnd,
      props.padding == null &&
        props.component !== "layout-content" &&
        props.outerBlockStart &&
        areaStyles.outerBlockStart,
      props.padding == null &&
        props.component !== "layout-content" &&
        props.outerBlockEnd &&
        areaStyles.outerBlockEnd,
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
      role={props.role ?? (props.label != null ? "region" : undefined)}
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

interface LayoutBarProps extends LayoutBaseProps {
  component: string;
  divider: typeof areaStyles.headerDivider | typeof areaStyles.footerDivider;
}

function LayoutBar(props: LayoutBarProps) {
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
  const rootStyle = createMemo(() =>
    stylexProps(areaStyles.bar, hasDivider() && props.divider, props.xstyle),
  );
  const innerStyle = createMemo(() =>
    stylexProps(
      areaStyles.barInner,
      props.component === "layout-header" ? areaStyles.headerInner : areaStyles.footerInner,
      props.padding === 0 && areaStyles.fullBleed,
      props.padding != null && paddingStyles[props.padding],
      props.padding != null && containerPaddingInlineVarStyles[props.padding],
      props.padding != null && containerPaddingBlockStartVarStyles[props.padding],
      props.padding != null && containerPaddingBlockEndVarStyles[props.padding],
    ),
  );

  return (
    <div
      {...rest}
      {...theme()}
      role={props.role ?? (props.label != null ? "region" : undefined)}
      aria-label={props.label}
      data-divider={hasDivider() || undefined}
      class={[theme().class, rootStyle().class, props.class]}
      style={{
        ...rootStyle().style,
        ...(props.height != null && { height: size(props.height) }),
        ...props.style,
      }}
      data-style-src={rootStyle()["data-style-src"]}
    >
      <div {...innerStyle()}>{props.children}</div>
    </div>
  );
}
