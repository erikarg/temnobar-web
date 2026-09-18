import type { ProductTag } from "@/types/product";

// Espelha o vocabulário fechado da API (product.schema.ts).
export const PRODUCT_TAGS: { value: ProductTag; label: string }[] = [
  { value: "sem-alcool", label: "Sem álcool" },
  { value: "low-abv", label: "Low ABV" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "vegano", label: "Vegano" },
  { value: "sem-gluten", label: "Sem glúten" },
  { value: "autoral", label: "Autoral" },
  { value: "novidade", label: "Novidade" },
];

export function tagLabel(tag: string): string {
  return PRODUCT_TAGS.find((item) => item.value === tag)?.label ?? tag;
}
