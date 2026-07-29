import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { spacingVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { FormLayoutContext, type FormLayoutDirection } from "./form-layout-context";

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

/** Arranges form fields in a responsive form layout. */
export function FormLayout(props: FormLayoutProps) {
  const merged = merge(
    {
      direction: "vertical",
    } satisfies FormLayoutProps,
    props,
  );
  const rest = omit(merged, "direction", "xstyle", "class", "style", "children");

  const theme = createMemo(() => themeProps("form-layout", { direction: merged.direction }));
  const style = createMemo(() =>
    stylexProps(
      styles.base,
      merged.direction === "horizontal" && styles.horizontal,
      merged.direction === "horizontal-labels" && styles.horizontalLabels,
      merged.xstyle,
    ),
  );

  const context = {
    get direction() {
      return merged.direction;
    },
  };

  return (
    <FormLayoutContext value={context}>
      <div
        {...rest}
        {...theme()}
        class={[theme().class, style().class, merged.class]}
        style={{ ...style().style, ...merged.style }}
        data-style-src={style()["data-style-src"]}
      >
        {merged.children}
      </div>
    </FormLayoutContext>
  );
}
