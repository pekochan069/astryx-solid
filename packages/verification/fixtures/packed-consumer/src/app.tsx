import { InternationalizationProvider, useTranslator } from "@astryx-solid/core/i18n";
import { defineTheme, Theme, useTheme } from "@astryx-solid/core/theme";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { createSignal } from "solid-js";

const lightTheme = defineTheme({ name: "consumer-light", tokens: { "--color-accent": "a" } });
const darkTheme = defineTheme({ name: "consumer-dark", tokens: { "--color-accent": "b" } });
const messages = {
  en: { greeting: { defaultMessage: "Hello" } },
  fr: { greeting: { defaultMessage: "Bonjour" } },
};

export function createApp() {
  const [alternate, setAlternate] = createSignal(false);
  if (typeof window !== "undefined") queueMicrotask(() => setAlternate(true));
  return (
    <Theme theme={alternate() ? darkTheme : lightTheme} mode={alternate() ? "dark" : "light"}>
      <InternationalizationProvider locale={alternate() ? "fr" : "en"} messages={messages}>
        <VisuallyHidden as="span">Close dialog</VisuallyHidden>
        <p data-testid="consumer-state">
          <ConsumerState />
        </p>
      </InternationalizationProvider>
    </Theme>
  );
}

function ConsumerState() {
  const theme = useTheme();
  const translate = useTranslator();
  return (
    <>
      {theme.name}:{theme.mode}:{theme.token("--color-accent")}:{translate("greeting")}
    </>
  );
}
