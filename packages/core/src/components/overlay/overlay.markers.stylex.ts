import * as stylex from "@stylexjs/stylex";

export const overlayScope = stylex.defineMarker();
export const overlayContainerStyles = stylex.create({
  root: { position: "relative", overflow: "clip" },
});
