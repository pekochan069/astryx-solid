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
