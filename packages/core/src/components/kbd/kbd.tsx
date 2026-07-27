import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal, For, omit, onSettled } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import {
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

const displayNames: Record<string, string> = {
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  enter: "↵",
  backspace: "⌫",
  escape: "Esc",
  tab: "⇥",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  plus: "+",
};

const spokenNames: Record<string, string> = {
  ctrl: "Control",
  alt: "Alt",
  shift: "Shift",
  enter: "Enter",
  backspace: "Backspace",
  escape: "Escape",
  tab: "Tab",
  up: "Up arrow",
  down: "Down arrow",
  left: "Left arrow",
  right: "Right arrow",
  plus: "Plus",
};
const styles = stylex.create({
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacingVars["--spacing-1"],
    flexShrink: 0,
  },
  key: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: spacingVars["--spacing-5"],
    height: spacingVars["--spacing-5"],
    paddingInline: spacingVars["--spacing-1"],
    borderRadius: radiusVars["--radius-inner"],
    backgroundColor: colorVars["--color-neutral"],
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: colorVars["--color-border-emphasized"],
    color: colorVars["--color-text-secondary"],
    fontFamily: typographyVars["--font-family-body"],
    fontSize: typeScaleVars["--text-supporting-size"],
    fontWeight: fontWeightVars["--font-weight-medium"],
    lineHeight: typeScaleVars["--text-supporting-leading"],
    userSelect: "none",
  },
});

function isMacPlatform() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? "");
}

function display(key: string, mac: boolean) {
  return key === "mod" ? (mac ? "⌘" : "Ctrl") : (displayNames[key] ?? key.toUpperCase());
}

function spoken(key: string, mac: boolean) {
  return key === "mod" ? (mac ? "Command" : "Control") : (spokenNames[key] ?? key.toUpperCase());
}

export interface KbdProps extends BaseProps<HTMLSpanElement> {
  keys: string;
}

export function Kbd(props: KbdProps) {
  const rest = omit(props, "keys", "xstyle", "class", "style");

  const [isMac, setIsMac] = createSignal(false);

  onSettled(() => {
    setIsMac(isMacPlatform());
  });

  const keys = createMemo(() => props.keys.split("+").map((key) => key.trim().toLowerCase()));

  const style = createMemo(() => stylexProps(styles.wrapper, props.xstyle));
  const theme = createMemo(() => themeProps("kbd"));

  return (
    <span
      {...rest}
      {...theme()}
      role="img"
      aria-label={keys()
        .map((key) => spoken(key, isMac()))
        .join(" + ")}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <For each={keys()}>
        {(key) => (
          <kbd
            aria-hidden="true"
            textContent={display(key, isMac())}
            {...stylexProps(styles.key)}
          />
        )}
      </For>
    </span>
  );
}
