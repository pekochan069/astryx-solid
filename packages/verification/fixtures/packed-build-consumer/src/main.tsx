import { render } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  message: { color: "rebeccapurple" },
});

render(
  () => <p {...stylex.props(styles.message)}>Packed Build export works</p>,
  document.getElementById("app")!,
);
