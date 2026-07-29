import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, merge, omit } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { themeProps } from "../../utils/theme-props";

export type AspectRatioShape = "rectangle" | "ellipse";
export type AspectRatioFit = "cover" | "contain" | "center";

export interface AspectRatioProps extends BaseProps<HTMLDivElement> {
  children?: JSX.Element;
  ratio: number;
  shape?: AspectRatioShape;
  fit?: AspectRatioFit;
}

const styles = stylex.create({
  root: {
    position: "relative",
    width: "100%",
    overflow: "clip",
    minHeight: 0,
    flexShrink: 0,
  },
  ellipse: { borderRadius: "50%" },
  child: {
    position: "absolute",
    insetBlockStart: 0,
    insetInlineStart: 0,
    width: "100%",
    height: "100%",
  },
  childCenter: { display: "flex", alignItems: "center", justifyContent: "center" },
});

/**
 * Maintains a ratio while positioning content inside its box.
 *
 * `fit` stays on the wrapper as a data attribute. Reset styles use that
 * marker to size media for `cover` and `contain`; `center` is handled by the
 * wrapper itself. This keeps child props untouched and lets consumer styles
 * win without adding descendants to the StyleX surface.
 */
export function AspectRatio(props: AspectRatioProps) {
  const merged = merge(
    {
      shape: "rectangle",
    } satisfies Partial<AspectRatioProps>,
    props,
  );

  const rest = omit(merged, "ratio", "shape", "fit", "xstyle", "class", "style", "children");

  const theme = createMemo(() => themeProps("aspect-ratio", { shape: merged.shape }));
  const style = createMemo(() =>
    stylexProps(styles.root, merged.shape === "ellipse" && styles.ellipse, merged.xstyle),
  );
  const childStyle = createMemo(() =>
    stylexProps(styles.child, merged.fit === "center" && styles.childCenter),
  );

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, style().class, merged.class]}
      style={{ ...style().style, "aspect-ratio": merged.ratio, ...merged.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div {...childStyle()} data-astryx-solid-aspect-ratio-override={merged.fit}>
        {merged.children}
      </div>
    </div>
  );
}
