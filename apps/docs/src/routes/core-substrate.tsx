import { Button } from "@astryx-solid/core/button";
import { InternationalizationProvider, useTranslator } from "@astryx-solid/core/i18n";
import { defineTheme, Theme, useTheme } from "@astryx-solid/core/theme";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/core-substrate")({
  component: CoreSubstrate,
});

const theme = defineTheme({
  name: "docs",
  tokens: { "--color-accent": ["#0064e0", "#1557a6"] },
  components: { button: { base: { backgroundColor: "var(--color-accent)" } } },
});

const messages = {
  en: { greeting: { defaultMessage: "Hello" } },
  fr: { greeting: { defaultMessage: "Bonjour" } },
};

function CoreSubstrate() {
  const [mode, setMode] = createSignal<"light" | "dark">("light");
  const [locale, setLocale] = createSignal<"en" | "fr">("en");

  return (
    <Theme theme={theme} mode={mode()}>
      <InternationalizationProvider locale={locale()} messages={messages}>
        <main>
          <h1>Core substrate</h1>
          <p data-testid="theme-state">
            <ThemeState />
          </p>
          <p data-testid="translation">
            <Translation />
          </p>
          <div class="astryx-solid-button" data-testid="theme-role">
            Theme role
          </div>
          <Button
            label="Toggle theme"
            onClick={() => setMode(mode() === "light" ? "dark" : "light")}
          />
          <Button
            label="Toggle locale"
            onClick={() => setLocale(locale() === "en" ? "fr" : "en")}
          />
        </main>
      </InternationalizationProvider>
    </Theme>
  );
}

function ThemeState() {
  const current = useTheme();
  return (
    <>
      {current.name}:{current.mode}:{current.token("--color-accent")}
    </>
  );
}

function Translation() {
  const translate = useTranslator();
  return <>{translate("greeting")}</>;
}
