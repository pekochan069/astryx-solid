import { VisuallyHidden as RootVisuallyHidden } from "@astryx-solid/core";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { render } from "@solidjs/web";
import "@astryx-solid/core/reset.css";
import "@astryx-solid/core/astryx.css";

render(
  () => (
    <button type="button">
      <span aria-hidden="true">×</span>
      <VisuallyHidden as="span">Close dialog</VisuallyHidden>
      <RootVisuallyHidden>Root export works</RootVisuallyHidden>
    </button>
  ),
  document.getElementById("app")!,
);
