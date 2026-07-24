import { describe, expect, it } from "bun:test";

import { mergeProps } from "../../src/utils/merge-props";

describe("StyleX prop merging", () => {
  it("preserves classes and lets consumer inline styles win", () => {
    expect(
      mergeProps(
        { class: "astryx-solid-button", "data-variant": "primary" },
        { class: "generated", style: { color: "red", padding: "4px" } },
        { class: "consumer", style: { color: "blue" } },
      ),
    ).toEqual({
      class: "astryx-solid-button generated consumer",
      "data-variant": "primary",
      style: { color: "blue", padding: "4px" },
    });
  });
});
