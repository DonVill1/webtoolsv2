import { convertUnit, formatNumber, type ConversionPair } from "./registry";
import { capitalizeFirst, quantityName, unitHeading, unitMany, unitOne } from "./grammar";

export function pairHref(pair: ConversionPair): string {
  return `/convert/${pair.category.slug}/${pair.slug}`;
}

export function pairTitle(pair: ConversionPair): string {
  const name = pairHeading(pair);
  const withSymbols = `${name} — ${pair.from.symbol} to ${pair.to.symbol}`;
  if (withSymbols.length <= 60) return withSymbols;
  if (name.length <= 50) return `${name} converter`;
  return `${pair.from.symbol} to ${pair.to.symbol} converter`;
}

export function pairDescription(pair: ConversionPair): string {
  const rawFactor = convertUnit(pair.category.id, 1, pair.from.id, pair.to.id);
  const factor = formatNumber(rawFactor, 8);
  const long = `Convert ${unitMany(pair.from)} to ${unitMany(pair.to)} instantly. One ${unitOne(
    pair.from,
  )} = ${factor} ${quantityName(rawFactor, pair.to)}, with a full conversion table, the formula and worked examples.`;
  if (long.length <= 158) return long;
  return `Convert ${pair.from.symbol} to ${pair.to.symbol} instantly with the exact factor, a full conversion table, the formula and worked examples. No sign-up.`;
}

export function pairHeading(pair: ConversionPair): string {
  return `${capitalizeFirst(unitHeading(pair.from))} to ${unitHeading(pair.to)}`;
}
