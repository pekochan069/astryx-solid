import {
  InteractiveRoleContext,
  SizeContext,
  useInteractiveRole,
  useSize,
} from "@astryx-solid/core";
import { InternationalizationProvider, useTranslator } from "@astryx-solid/core/i18n";
import { defineTheme, Theme, useTheme } from "@astryx-solid/core/theme";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, createUniqueId } from "solid-js";

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

export function CoreSubstrate() {
  // ponytail: Solid 2 beta SSR ID offset; remove after Start/Solid stable hydration matches.
  if (import.meta.env.SSR) createUniqueId();

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

          <InteractiveRoleContext value={{ role: "button" }}>
            <p data-testid="interactive-role">
              <InteractiveRole />
            </p>
          </InteractiveRoleContext>

          <SizeContext value={{ size: "sm" }}>
            <p data-testid="inherited-size">
              <InheritedSize />
            </p>
          </SizeContext>

          <div class="astryx-solid-button" data-testid="theme-role" style={{ color: "#fff" }}>
            Theme role
          </div>

          <button
            type="button"
            class="astryx-solid-button docs-button"
            onClick={() => setMode(mode() === "light" ? "dark" : "light")}
          >
            Toggle theme
          </button>

          <button
            type="button"
            class="astryx-solid-button docs-button"
            onClick={() => setLocale(locale() === "en" ? "fr" : "en")}
          >
            Toggle locale
          </button>
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

function InteractiveRole() {
  const role = useInteractiveRole({});

  return <>{role()}</>;
}

function InheritedSize() {
  const size = useSize();

  return <>{size()}</>;
}
