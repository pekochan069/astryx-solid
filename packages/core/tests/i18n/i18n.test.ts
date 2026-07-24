import { render } from "@solidjs/web";
import { afterEach, describe, expect, it } from "bun:test";
import { createComponent, createEffect, createSignal } from "solid-js";

import { InternationalizationProvider } from "../../src/i18n/internationalization-provider";
import { resolve, resolveLocaleChain } from "../../src/i18n/resolve";
import { useTranslator } from "../../src/i18n/use-translator";

afterEach(() => document.body.replaceChildren());

describe("i18n substrate", () => {
  it("walks regional locale fallbacks", () => {
    expect(resolveLocaleChain("zh-Hans-CN")).toEqual(["zh-Hans-CN", "zh-Hans", "zh"]);
    expect(resolveLocaleChain("pt-br")).toEqual(["pt-BR", "pt"]);
  });

  it("formats numbers and plural messages", () => {
    const messages = {
      en: {
        items: { defaultMessage: "{count, plural, one {# item} other {# items}}" },
        total: { defaultMessage: "Total: {value, number}" },
      },
    };
    expect(resolve("items", { count: 2 }, "en", messages)).toBe("2 items");
    expect(resolve("total", { value: 1200 }, "en", messages)).toContain("1,200");
  });

  it("uses overrides before catalogs and English fallback", () => {
    const messages = { fr: { greeting: { defaultMessage: "Bonjour" } } };
    expect(resolve("greeting", undefined, "fr-CA", messages, { fr: { greeting: "Salut" } })).toBe(
      "Salut",
    );
    expect(resolve("@astryx.pagination.next", undefined, "fr", {})).toBe("Go to next page");
  });

  it("updates translator context when provider props change", async () => {
    const [locale, setLocale] = createSignal<"en" | "fr">("en");
    const messages = {
      en: { greeting: { defaultMessage: "Hello" } },
      fr: { greeting: { defaultMessage: "Bonjour" } },
    };
    const Probe = () => {
      const translate = useTranslator();
      const node = document.createElement("span");
      createEffect(
        () => translate("greeting"),
        (text) => {
          node.textContent = text;
        },
      );
      return node;
    };
    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
      () =>
        createComponent(InternationalizationProvider, {
          get locale() {
            return locale();
          },
          messages,
          get children() {
            return createComponent(Probe, {});
          },
        }),
      container,
    );
    expect(container.textContent).toBe("Hello");
    setLocale("fr");
    await Promise.resolve();
    expect(container.textContent).toBe("Bonjour");
    dispose();
  });
});
