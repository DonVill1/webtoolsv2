import { describe, expect, it } from "vitest";
import {
  categoryBySlug,
  conversionPairs,
  convertUnit,
  formatNumber,
  getUnit,
  pairBySlug,
  parsePair,
  unitCategories,
} from "@/lib/units/registry";

describe("unit registry", () => {
  it("has unique category and unit slugs", () => {
    const categories = unitCategories.map((category) => category.slug);
    expect(new Set(categories).size).toBe(categories.length);

    const units = unitCategories.flatMap((category) => category.units.map((unit) => unit.slug));
    expect(new Set(units).size).toBe(units.length);
  });

  it("uses exact imperial definitions", () => {
    expect(convertUnit("length", 1, "in", "cm")).toBeCloseTo(2.54, 12);
    expect(convertUnit("length", 1, "ft", "m")).toBeCloseTo(0.3048, 12);
    expect(convertUnit("length", 1, "mi", "km")).toBeCloseTo(1.609344, 12);
    expect(convertUnit("weight", 1, "lb", "kg")).toBeCloseTo(0.45359237, 12);
    expect(convertUnit("volume", 1, "gal", "l")).toBeCloseTo(3.785411784, 12);
    expect(convertUnit("area", 1, "ac", "m2")).toBeCloseTo(4046.8564224, 9);
    expect(convertUnit("speed", 1, "mph", "mps")).toBeCloseTo(0.44704, 12);
    expect(convertUnit("pressure", 1, "psi", "pa")).toBeCloseTo(6894.757293168, 9);
  });

  it("keeps SI decimal and IEC binary data sizes separate", () => {
    expect(convertUnit("data", 1, "mb", "kb")).toBe(1000);
    expect(convertUnit("data", 1, "mib", "kib")).toBe(1024);
    expect(convertUnit("data", 1, "gib", "gb")).toBeCloseTo(1.073741824, 12);
    expect(convertUnit("data-rate", 1, "mbps", "mbyteps")).toBeCloseTo(0.125, 12);
  });

  it("converts temperatures with offsets, not factors", () => {
    expect(convertUnit("temperature", 0, "c", "f")).toBe(32);
    expect(convertUnit("temperature", 100, "c", "f")).toBe(212);
    expect(convertUnit("temperature", -40, "c", "f")).toBe(-40);
    expect(convertUnit("temperature", 0, "k", "c")).toBe(-273.15);
    expect(convertUnit("temperature", 32, "f", "c")).toBe(0);
  });

  it("round-trips every unit back to itself", () => {
    for (const category of unitCategories) {
      for (const unit of category.units) {
        const there = convertUnit(category.id, 7.25, category.defaultFrom, unit.id);
        const back = convertUnit(category.id, there, unit.id, category.defaultFrom);
        expect(back).toBeCloseTo(7.25, 9);
      }
    }
  });

  it("formats numbers without losing significant digits", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1234.5)).toBe("1,234.5");
    expect(formatNumber(-1234.567, 6)).toBe("-1,234.57");
    expect(formatNumber(0.0000001)).toBe("1.0000e-7");
    expect(formatNumber(Number.NaN)).toBe("—");
  });

  it("publishes only curated, resolvable pairs", () => {
    expect(conversionPairs.length).toBe(60);
    expect(new Set(conversionPairs.map((pair) => pair.slug)).size).toBe(conversionPairs.length);

    for (const pair of conversionPairs) {
      expect(pairBySlug.get(pair.slug)).toBe(pair);
      expect(parsePair(pair.slug)).not.toBeNull();
      expect(pair.from.id).not.toBe(pair.to.id);
      expect(pair.category.id).toBe(categoryBySlug.get(pair.category.slug)?.id);
    }
  });

  it("resolves unit lookups and rejects unknown ids", () => {
    expect(getUnit("length", "ft").symbol).toBe("ft");
    expect(() => getUnit("length", "parsec")).toThrowError(/Unknown unit/);
  });
});
