import * as stylex from "@stylexjs/stylex";

export const layerStyles = stylex.create({
  base: {
    margin: 0,
    padding: 0,
    border: 0,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  fixed: { position: "fixed" },
});
