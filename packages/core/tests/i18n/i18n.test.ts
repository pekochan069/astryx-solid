import { describe, expect, it } from "bun:test";

import { resolve, resolveLocaleChain } from "../../src/i18n/resolve";

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
});
