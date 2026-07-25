# @astryx-solid/core

Solid-native Astryx styling and theme substrate.

```tsx
import { Button, defineTheme, Theme } from "@astryx-solid/core";
import "@astryx-solid/core/reset.css";
import "@astryx-solid/core/astryx.css";

const theme = defineTheme({ name: "app", tokens: { "--color-accent": "#0064e0" } });

<Theme theme={theme} mode="system">
  <Button label="Continue" variant="primary" />
</Theme>;
```

Public subpaths expose naming, StyleX merging, theme tokens and syntax themes,
i18n, locale JSON, interaction contexts/hooks, and CSS roles. See
[`docs/core-reactive-substrate.md`](../../docs/core-reactive-substrate.md) for
controlled state, events, refs, IDs, contexts, and lifecycle rules.
