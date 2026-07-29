import { Dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit, Show } from "solid-js";

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
export type IconValue = JSX.Element | IconType | null;
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
  const icons: Record<string, IconValue> = { ...defaultIcons };

  for (const [name, icon] of Object.entries(registry)) {
    if (icon != null) icons[name] = icon;
  }

  return icons;
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
  xsm: { width: "0.75rem", height: "0.75rem" },
  sm: { width: "1rem", height: "1rem" },
  md: { width: "1.25rem", height: "1.25rem" },
  lg: { width: "1.5rem", height: "1.5rem" },
});

const spanSizeStyles = stylex.create({
  xsm: { width: "0.75rem", height: "0.75rem", fontSize: "0.75rem" },
  sm: { width: "1rem", height: "1rem", fontSize: "1rem" },
  md: { width: "1.25rem", height: "1.25rem", fontSize: "1.25rem" },
  lg: { width: "1.5rem", height: "1.5rem", fontSize: "1.5rem" },
});

export interface IconProps extends Omit<
  JSX.SvgSVGAttributes<SVGSVGElement>,
  "color" | "icon" | "style" | "label"
> {
  icon: IconType | IconName;
  color?: IconColor;
  size?: IconSize;
  xstyle?: never;
  style?: JSX.CSSProperties;
  label?: string;
  "data-testid"?: string;
}

export function Icon(props: IconProps) {
  const merged = merge(
    {
      color: "inherit",
      size: "md",
    } satisfies Partial<IconProps>,
    props,
  );

  const rest = omit(
    merged,
    "icon",
    "color",
    "size",
    "class",
    "style",
    "label",
    "role",
    "aria-label",
    "aria-hidden",
  );

  const hasLabel = () => merged.label != null && merged.label !== "";
  const role = () => merged.role ?? (hasLabel() ? "img" : undefined);
  const ariaLabel = () => merged["aria-label"] ?? (hasLabel() ? merged.label : undefined);
  const ariaHidden = () => merged["aria-hidden"] ?? (hasLabel() ? undefined : "true");

  const theme = createMemo(() => themeProps("icon", { size: merged.size, color: merged.color }));
  const style = createMemo(() =>
    stylexProps(styles.root, styles[merged.color], styles[merged.size]),
  );
  const spanStyle = createMemo(() =>
    stylexProps(styles.span, styles[merged.color], spanSizeStyles[merged.size]),
  );

  const isRegistered = () => typeof merged.icon === "string" && isIconName(merged.icon);
  const registeredIcon = createMemo(() =>
    isRegistered() && typeof merged.icon === "string" ? getIcon(merged.icon) : undefined,
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
          component={merged.icon}
          {...rest}
          {...theme()}
          role={role()}
          aria-label={ariaLabel()}
          aria-hidden={ariaHidden()}
          class={[theme().class, style().class, merged.class]}
          style={{ ...style().style, ...merged.style }}
          data-style-src={style()["data-style-src"]}
        />
      }
    >
      <span
        {...theme()}
        data-testid={merged["data-testid"]}
        role={role()}
        aria-label={ariaLabel()}
        aria-hidden={ariaHidden()}
        class={[theme().class, spanStyle().class, merged.class]}
        style={{ ...spanStyle().style, ...merged.style }}
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
