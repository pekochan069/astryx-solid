import {
  Button,
  Center,
  FormLayout,
  Grid,
  IconButton,
  Layout,
  Link,
  Section,
  ToggleButtonGroup,
} from "@astryx-solid/core";
import { InternationalizationProvider } from "@astryx-solid/core/i18n";
import { defineTheme, Theme } from "@astryx-solid/core/theme";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";

const theme = defineTheme({ name: "negative" });

// @ts-expect-error: theme modes are limited to the public ThemeMode contract.
<Theme theme={theme} mode="sepia" />;

// @ts-expect-error: locales must be BCP 47 strings.
<InternationalizationProvider locale={42} />;

// @ts-expect-error: href is not valid when the polymorphic target is a button.
<VisuallyHidden as="button" href="/invalid" />;

// @ts-expect-error: Center axis uses its constrained public union.
<Center axis="diagonal" />;

// @ts-expect-error: FormLayout direction uses its constrained public union.
<FormLayout direction="inline" />;

// @ts-expect-error: Grid columns cannot be a CSS template string.
<Grid columns="1fr 1fr" />;

// @ts-expect-error: Layout height uses its constrained public union.
<Layout height="fixed" />;

// @ts-expect-error: Section variant uses its constrained public union.
<Section variant="raised" />;

// @ts-expect-error: explicit Solid router adapters do not inject React Router `to`.
<Link href="/docs" to="/docs">
  Docs
</Link>;

// @ts-expect-error: Button refs must accept either truthful button or anchor roots.
<Button label="Root" ref={(element: HTMLButtonElement) => element.focus()} />;

// @ts-expect-error: IconButton requires an icon.
<IconButton label="Settings" />;

// @ts-expect-error: single groups require nullable string values.
<ToggleButtonGroup label="View" value={["grid"]} onChange={() => {}} />;
