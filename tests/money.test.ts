import { describe, it, expect } from "vitest";
import { formatPrice, formatPriceInput, parsePriceInput } from "@/lib/money";

// Intl separa "R$" do valor com espaco nao separavel.
const NBSP = " ";

describe("formatPrice", () => {
  it("formats cents as Brazilian reais", () => {
    expect(formatPrice(1290)).toBe(`R$${NBSP}12,90`);
  });

  it("formats zero as R$ 0,00", () => {
    expect(formatPrice(0)).toBe(`R$${NBSP}0,00`);
  });

  it("keeps amounts below one real in cents", () => {
    expect(formatPrice(5)).toBe(`R$${NBSP}0,05`);
  });

  it("groups thousands with a dot", () => {
    expect(formatPrice(123456)).toBe(`R$${NBSP}1.234,56`);
  });
});

describe("parsePriceInput", () => {
  it("reads a comma-separated amount as cents", () => {
    expect(parsePriceInput("12,90")).toBe(1290);
  });

  it("reads a dot-separated amount as cents", () => {
    expect(parsePriceInput("12.90")).toBe(1290);
  });

  it("reads bare digits as cents", () => {
    expect(parsePriceInput("1290")).toBe(1290);
  });

  it("ignores the currency symbol and thousands separator", () => {
    expect(parsePriceInput("R$ 1.234,56")).toBe(123456);
  });

  it("returns zero for an empty or non-numeric input", () => {
    expect(parsePriceInput("")).toBe(0);
    expect(parsePriceInput("abc")).toBe(0);
  });
});

describe("formatPriceInput", () => {
  it("shows cents with two decimals and no currency symbol", () => {
    expect(formatPriceInput(1290)).toBe("12,90");
  });

  it("shows zero as 0,00", () => {
    expect(formatPriceInput(0)).toBe("0,00");
  });

  it("round-trips what parsePriceInput reads", () => {
    expect(parsePriceInput(formatPriceInput(123456))).toBe(123456);
  });
});
