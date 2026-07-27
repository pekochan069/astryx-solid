import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, omit, Show } from "solid-js";

import { stylexProps } from "../../stylex";
import { colorVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { defaultIcons } from "./default-icons";

export type IconName =
  | "close"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "check"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "calendar"
  | "clock"
  | "externalLink"
  | "menu"
  | "moreHorizontal"
  | "search"
  | "arrowUp"
  | "arrowDown"
  | "arrowsUpDown"
  | "funnel"
  | "eyeSlash"
  | "viewColumns"
  | "copy"
  | "checkDouble"
  | "wrench"
  | "stop"
  | "microphone";
export type IconType = ValidComponent;
export type IconValue = JSX.Element | IconType;
export type IconColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "accent"
  | "success"
  | "error"
  | "warning"
  | "inherit"
  | "blue"
  | "red"
  | "green"
  | "gray"
  | "cyan"
  | "teal"
  | "yellow"
  | "orange"
  | "pink"
  | "purple";
export type IconSize = "xsm" | "sm" | "md" | "lg";
export type IconRegistry = Partial<Record<IconName, IconValue>>;

let registry: Record<string, IconValue | undefined> = {};

export function registerIcons(icons: IconRegistry) {
  registry = { ...registry, ...icons };
}

export function getIconRegistry() {
  return { ...defaultIcons, ...registry };
}

function isIconName(name: string): name is IconName {
  return Object.hasOwn(defaultIcons, name);
}

function isIconComponent(icon: IconValue | undefined): icon is IconType {
  return typeof icon === "function" || typeof icon === "string";
}

export function getIcon(name: string) {
  return registry[name] ?? (isIconName(name) ? defaultIcons[name] : undefined);
}

export function resetIcons() {
  registry = {};
}

const styles = stylex.create({
  root: { flexShrink: 0 },
  span: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  primary: { color: colorVars["--color-icon-primary"] },
  secondary: { color: colorVars["--color-icon-secondary"] },
  tertiary: { color: colorVars["--color-icon-secondary"] },
  disabled: { color: colorVars["--color-icon-disabled"] },
  accent: { color: colorVars["--color-accent"] },
  success: { color: colorVars["--color-success"] },
  error: { color: colorVars["--color-error"] },
  warning: { color: colorVars["--color-warning"] },
  inherit: { color: "inherit" },
  blue: { color: colorVars["--color-icon-blue"] },
  red: { color: colorVars["--color-icon-red"] },
  green: { color: colorVars["--color-icon-green"] },
  gray: { color: colorVars["--color-icon-gray"] },
  cyan: { color: colorVars["--color-icon-cyan"] },
  teal: { color: colorVars["--color-icon-teal"] },
  yellow: { color: colorVars["--color-icon-yellow"] },
  orange: { color: colorVars["--color-icon-orange"] },
  pink: { color: colorVars["--color-icon-pink"] },
  purple: { color: colorVars["--color-icon-purple"] },
  xsm: { width: 12, height: 12, fontSize: 12 },
  sm: { width: 16, height: 16, fontSize: 16 },
  md: { width: 20, height: 20, fontSize: 20 },
  lg: { width: 24, height: 24, fontSize: 24 },
});

export interface IconProps extends Omit<
  JSX.SvgSVGAttributes<SVGSVGElement>,
  "color" | "icon" | "style"
> {
  icon: IconType | IconName;
  color?: IconColor;
  size?: IconSize;
  xstyle?: never;
  style?: JSX.CSSProperties;
  "data-testid"?: string;
}

export function Icon(props: IconProps) {
  const rest = omit(props, "icon", "color", "size", "class", "style");

  const color = () => props.color ?? "inherit";
  const size = () => props.size ?? "md";

  const theme = createMemo(() => themeProps("icon", { size: size(), color: color() }));
  const style = createMemo(() => stylexProps(styles.root, styles[color()], styles[size()]));
  const spanStyle = createMemo(() => stylexProps(styles.span, styles[color()], styles[size()]));

  const isRegistered = () => typeof props.icon === "string" && isIconName(props.icon);
  const registeredIcon = createMemo(() =>
    isRegistered() && typeof props.icon === "string" ? getIcon(props.icon) : undefined,
  );

  const RegisteredElement = () => {
    const icon = registeredIcon();
    return isIconComponent(icon) ? <Dynamic component={icon} /> : icon;
  };

  return (
    <Show
      when={isRegistered()}
      fallback={
        <Dynamic
          component={props.icon}
          {...rest}
          {...theme()}
          aria-hidden={props["aria-hidden"] ?? "true"}
          class={[theme().class, style().class, props.class]}
          style={{ ...style().style, ...props.style }}
          data-style-src={style()["data-style-src"]}
        />
      }
    >
      <span
        {...theme()}
        data-testid={props["data-testid"]}
        role={props.role}
        aria-label={props["aria-label"]}
        aria-hidden={props["aria-hidden"] ?? "true"}
        class={[theme().class, spanStyle().class, props.class]}
        style={{ ...spanStyle().style, ...props.style }}
        data-style-src={spanStyle()["data-style-src"]}
      >
        <RegisteredElement />
      </span>
    </Show>
  );
}

export function renderIconSlot(
  icon: JSX.Element | IconType | IconName,
  props?: { size?: IconSize; color?: IconColor },
) {
  return typeof icon === "string" || typeof icon === "function" ? (
    <Icon icon={icon} {...props} />
  ) : (
    icon
  );
}
