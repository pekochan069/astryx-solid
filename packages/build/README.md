# @astryx-solid/build

Vite Plus integration for applications that use Astryx Solid CSS and StyleX.

```ts
import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import { astryxStylex } from "@astryx-solid/build/vite";

export default defineConfig({
  plugins: [...astryxStylex(), solid()],
});
```

The plugin declares `reset, astryx-base, astryx-theme, product` CSS layer order and configures StyleX for application code. Import the published Astryx CSS assets in that order:

```css
@import "@astryx-solid/core/reset.css" layer(reset);
@import "@astryx-solid/core/astryx.css" layer(astryx-base);
```

`@astryx-solid/build` re-exports `astryxStylex`; `@astryx-solid/build/vite` is the canonical subpath.
