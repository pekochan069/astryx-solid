import * as stylex from "@stylexjs/stylex";

export const truncationStyles = stylex.create({
  singleLine: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },
  multiLine: { overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" },
});
