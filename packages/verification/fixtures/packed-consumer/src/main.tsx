import { VisuallyHidden as RootVisuallyHidden } from "@astryx-solid/core";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { hydrate, render } from "@solidjs/web";
import "@astryx-solid/core/reset.css";
import "@astryx-solid/core/astryx.css";

const root = document.getElementById("app")!;
const serverElement = root.firstElementChild;
hydrate(() => <VisuallyHidden as="span">Close dialog</VisuallyHidden>, root);
root.dataset.hydrated = serverElement === root.firstElementChild ? "reused" : "replaced";
render(
  () => <RootVisuallyHidden>Root export works</RootVisuallyHidden>,
  document.getElementById("root-export")!,
);
