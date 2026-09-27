import { describe, it, expect } from "vitest";
import { PRODUCT_TAGS, tagLabel } from "@/lib/tags";

describe("tagLabel", () => {
  it("returns the display label of a known tag", () => {
    expect(tagLabel("sem-alcool")).toBe("Sem álcool");
    expect(tagLabel("low-abv")).toBe("Low ABV");
  });

  it("falls back to the raw value for an unknown tag", () => {
    expect(tagLabel("promocao")).toBe("promocao");
  });
});

describe("PRODUCT_TAGS", () => {
  it("mirrors the API's closed tag vocabulary", () => {
    expect(PRODUCT_TAGS.map((tag) => tag.value)).toEqual([
      "sem-alcool",
      "low-abv",
      "vegetariano",
      "vegano",
      "sem-gluten",
      "autoral",
      "novidade",
    ]);
  });
});
