import { Center, FormLayout, Grid, Layout, Section } from "@astryx-solid/core";
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
