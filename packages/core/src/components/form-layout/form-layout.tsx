import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createContext, createMemo, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { spacingVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export type FormLayoutDirection = "vertical" | "horizontal" | "horizontal-labels";
export interface FormLayoutContextValue {
  readonly direction: FormLayoutDirection;
}
export const FormLayoutContext = createContext<FormLayoutContextValue>({ direction: "vertical" });

export interface FormLayoutProps extends BaseProps<HTMLDivElement> {
  direction?: FormLayoutDirection;
  children?: JSX.Element;
}

const styles = stylex.create({
  base: { display: "flex", flexDirection: "column", gap: spacingVars["--spacing-4"] },
  horizontal: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "1fr" },
  horizontalLabels: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: `${spacingVars["--spacing-3"]} ${spacingVars["--spacing-4"]}`,
    alignItems: "start",
    "@media (max-width: 480px)": {
      display: "flex",
      flexDirection: "column",
      gap: spacingVars["--spacing-4"],
    },
  },
});

/** Arranges form fields and provides their layout direction. */
export function FormLayout(props: FormLayoutProps) {
  const direction = () => props.direction ?? "vertical";
  const rest = omit(props, "direction", "xstyle", "class", "style", "children");
  const root = createMemo(() =>
    stylexProps(
      styles.base,
      direction() === "horizontal" && styles.horizontal,
      direction() === "horizontal-labels" && styles.horizontalLabels,
      props.xstyle,
    ),
  );
  const theme = createMemo(() => themeProps("form-layout", { direction: direction() }));
  const value: FormLayoutContextValue = {
    get direction() {
      return direction();
    },
  };

  return (
    <FormLayoutContext value={value}>
      <div
        {...rest}
        {...theme()}
        class={[theme().class, root().class, props.class]}
        style={{ ...root().style, ...props.style }}
        data-style-src={root()["data-style-src"]}
      >
        {props.children}
      </div>
    </FormLayoutContext>
  );
}
