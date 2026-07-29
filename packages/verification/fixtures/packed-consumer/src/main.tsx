import { VisuallyHidden as RootVisuallyHidden } from "@astryx-solid/core";
import { resolveLocaleChain } from "@astryx-solid/core/i18n";
import en from "@astryx-solid/core/locales/en.json" with { type: "json" };
import { stableClassName } from "@astryx-solid/core/naming";
import { stylexProps } from "@astryx-solid/core/stylex";
import { defineTheme, resolveThemeToken } from "@astryx-solid/core/theme";
import { syntaxTokenDefaults } from "@astryx-solid/core/theme/syntax";
import { colorDefaults } from "@astryx-solid/core/theme/tokens.stylex";
import { mergeProps } from "@astryx-solid/core/utils";
import { hydrate, render } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import "@astryx-solid/core/reset.css";
import "@astryx-solid/core/astryx.css";
import "@astryx-solid/core/tailwind-theme.css";

import {
  actionExportsMatch,
  ContentPrimitives,
  createApp,
  PackedActions,
  PackedInteractiveActions,
  PackedContainerStatus,
  PackedLayout,
  packedPrimitives,
} from "./app";

if (!actionExportsMatch) throw new Error("Action root and subpath exports differ");

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
) {
  throw new Error("Core styling and locale exports failed");
}

function requireRoot(id: string) {
  const root = document.getElementById(id);

  if (root === null) throw new Error(`Missing #${id} root`);

  return root;
}

function hydrateAndRecord(root: HTMLElement, hydration: () => void) {
  const serverElement = root.firstElementChild;

  hydration();

  root.dataset.hydrated = serverElement === root.firstElementChild ? "reused" : "replaced";
}

const root = requireRoot("app");
const serverContext = root.querySelector('[data-testid="consumer-state"]')?.textContent;
hydrateAndRecord(root, () => hydrate(createApp, root));
root.dataset.serverContext = serverContext;

render(
  () => <RootVisuallyHidden>Root export works</RootVisuallyHidden>,
  requireRoot("root-export"),
);

const primitiveRoot = requireRoot("content-primitives");
hydrateAndRecord(primitiveRoot, () =>
  hydrate(
    () => {
      createUniqueId();
      return ContentPrimitives();
    },
    primitiveRoot,
    { renderId: "primitives" },
  ),
);

const containerStatusRoot = requireRoot("packed-container-status");
hydrateAndRecord(containerStatusRoot, () => {
  containerStatusRoot.replaceChildren();
  render(PackedContainerStatus, containerStatusRoot);
});

const layoutRoot = requireRoot("packed-layout");
hydrateAndRecord(layoutRoot, () =>
  hydrate(
    () => {
      createUniqueId();
      return PackedLayout();
    },
    layoutRoot,
    { renderId: "layout" },
  ),
);

for (const [name, component] of Object.entries(packedPrimitives)) {
  const packedRoot = requireRoot(`packed-${name}`);
  hydrateAndRecord(packedRoot, () => hydrate(component, packedRoot, { renderId: name }));
}

const actionRoot = requireRoot("packed-actions");
hydrateAndRecord(actionRoot, () => {
  actionRoot.replaceChildren();
  render(PackedActions, actionRoot);
});

const adapterRoot = document.createElement("div");
document.body.append(adapterRoot);
render(PackedInteractiveActions, adapterRoot);
