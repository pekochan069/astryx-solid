import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, omit } from "solid-js";

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
  child: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  childCenter: { display: "flex", alignItems: "center", justifyContent: "center" },
});

/** Maintains a ratio while positioning its content inside the box. */
export function AspectRatio(props: AspectRatioProps) {
  const shape = () => props.shape ?? "rectangle";

  const rest = omit(props, "ratio", "shape", "fit", "xstyle", "class", "style", "children");
  const style = createMemo(() =>
    stylexProps(styles.root, shape() === "ellipse" && styles.ellipse, props.xstyle),
  );
  const childStyle = createMemo(() =>
    stylexProps(styles.child, props.fit === "center" && styles.childCenter),
  );
  const theme = createMemo(() => themeProps("aspect-ratio", { shape: shape() }));

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, "aspect-ratio": props.ratio, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <div {...childStyle()} data-astryx-solid-aspect-ratio-override={props.fit}>
        {props.children}
      </div>
    </div>
  );
}
