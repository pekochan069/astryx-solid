import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { renderToString } from "@solidjs/web";

const render = () =>
  renderToString(() => (
    <VisuallyHidden as="span" aria-live="polite">
      Upload complete
    </VisuallyHidden>
  ));

const first = render();
if (
  first !== render() ||
  !first.includes('aria-live="polite"') ||
  !first.includes("Upload complete")
) {
  throw new Error(`Unexpected server output: ${first}`);
}
console.log(first);
