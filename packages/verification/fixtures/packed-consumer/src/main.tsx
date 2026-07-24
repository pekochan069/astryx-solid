import { VisuallyHidden as RootVisuallyHidden } from "@astryx-solid/core";
import { resolveLocaleChain } from "@astryx-solid/core/i18n";
import en from "@astryx-solid/core/locales/en.json" with { type: "json" };
import { stableClassName } from "@astryx-solid/core/naming";
import { stylexProps } from "@astryx-solid/core/stylex";
import { defineTheme, resolveThemeToken } from "@astryx-solid/core/theme";
import { syntaxTokenDefaults } from "@astryx-solid/core/theme/syntax";
import { colorDefaults } from "@astryx-solid/core/theme/tokens.stylex";
import { mergeProps } from "@astryx-solid/core/utils";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { hydrate, render } from "@solidjs/web";
import "@astryx-solid/core/reset.css";
import "@astryx-solid/core/astryx.css";
import "@astryx-solid/core/tailwind-theme.css";

if (
  stableClassName("button") !== "astryx-solid-button" ||
  resolveThemeToken(
    defineTheme({ name: "consumer", tokens: { "--color-accent": ["a", "b"] } }),
    "--color-accent",
    { mode: "dark" },
  ) !== "b" ||
  resolveLocaleChain("pt-BR").join(",") !== "pt-BR,pt" ||
  en["@astryx.pagination.next"].defaultMessage !== "Go to next page" ||
  !syntaxTokenDefaults["--color-syntax-keyword"] ||
  !colorDefaults["--color-accent"] ||
  !stylexProps ||
  !mergeProps
)
  throw new Error("Core styling and locale exports failed");

const root = document.getElementById("app")!;
const serverElement = root.firstElementChild;
hydrate(() => <VisuallyHidden as="span">Close dialog</VisuallyHidden>, root);
root.dataset.hydrated = serverElement === root.firstElementChild ? "reused" : "replaced";
render(
  () => <RootVisuallyHidden>Root export works</RootVisuallyHidden>,
  document.getElementById("root-export")!,
);
