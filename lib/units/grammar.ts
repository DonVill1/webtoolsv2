import type { Unit } from "./registry";

/**
 * Display grammar for units, kept separate from the conversion maths.
 *
 * `unit.name` is a label ("Feet", "Cups (US)", "Pounds per square inch"), not
 * a noun phrase that survives every sentence. Programmatic pages that write
 * "one feet" or "one celsius" read as generated text, so every unit used by a
 * published pair gets an explicit singular and plural here.
 */
export interface UnitGrammar {
  one: string;
  many: string;
}

const grammar: Record<string, UnitGrammar> = {
  // Length
  ft: { one: "foot", many: "feet" },
  in: { one: "inch", many: "inches" },
  cm: { one: "centimetre", many: "centimetres" },
  m: { one: "metre", many: "metres" },
  km: { one: "kilometre", many: "kilometres" },
  mi: { one: "mile", many: "miles" },

  // Weight and mass
  kg: { one: "kilogram", many: "kilograms" },
  lb: { one: "pound", many: "pounds" },
  g: { one: "gram", many: "grams" },
  oz: { one: "ounce", many: "ounces" },
  st: { one: "stone", many: "stones" },

  // Temperature
  c: { one: "degree Celsius", many: "degrees Celsius" },
  f: { one: "degree Fahrenheit", many: "degrees Fahrenheit" },
  k: { one: "kelvin", many: "kelvins" },

  // Data
  kb: { one: "kilobyte", many: "kilobytes" },
  mb: { one: "megabyte", many: "megabytes" },
  gb: { one: "gigabyte", many: "gigabytes" },
  tb: { one: "terabyte", many: "terabytes" },
  mib: { one: "mebibyte", many: "mebibytes" },
  gib: { one: "gibibyte", many: "gibibytes" },

  // Speed
  kmh: { one: "kilometre per hour", many: "kilometres per hour" },
  mph: { one: "mile per hour", many: "miles per hour" },
  kn: { one: "knot", many: "knots" },
  mps: { one: "metre per second", many: "metres per second" },
  fps: { one: "foot per second", many: "feet per second" },

  // Area
  ft2: { one: "square foot", many: "square feet" },
  m2: { one: "square metre", many: "square metres" },
  ac: { one: "acre", many: "acres" },
  ha: { one: "hectare", many: "hectares" },
  yd2: { one: "square yard", many: "square yards" },

  // Volume
  l: { one: "litre", many: "litres" },
  gal: { one: "US gallon", many: "US gallons" },
  cup: { one: "US cup", many: "US cups" },
  ml: { one: "millilitre", many: "millilitres" },
  floz: { one: "US fluid ounce", many: "US fluid ounces" },

  // Time
  h: { one: "hour", many: "hours" },
  min: { one: "minute", many: "minutes" },
  d: { one: "day", many: "days" },
  wk: { one: "week", many: "weeks" },
  yr: { one: "year", many: "years" },

  // Pressure
  bar: { one: "bar", many: "bar" },
  psi: { one: "pound per square inch", many: "pounds per square inch" },
  atm: { one: "atmosphere", many: "atmospheres" },
  kpa: { one: "kilopascal", many: "kilopascals" },

  // Energy
  kj: { one: "kilojoule", many: "kilojoules" },
  kcal: { one: "kilocalorie", many: "kilocalories" },
  kwh: { one: "kilowatt-hour", many: "kilowatt-hours" },
  cal: { one: "calorie", many: "calories" },
  j: { one: "joule", many: "joules" },
  btu: { one: "British thermal unit", many: "British thermal units" },

  // Data rate
  mbps: { one: "megabit per second", many: "megabits per second" },
  mbyteps: { one: "megabyte per second", many: "megabytes per second" },
  gbps: { one: "gigabit per second", many: "gigabits per second" },
  kbps: { one: "kilobit per second", many: "kilobits per second" },
  kbyteps: { one: "kilobyte per second", many: "kilobytes per second" },

  // Angle
  deg: { one: "degree", many: "degrees" },
  rad: { one: "radian", many: "radians" },
  grad: { one: "gradian", many: "gradians" },
  turn: { one: "turn", many: "turns" },
};

export function unitOne(unit: Unit): string {
  return grammar[unit.id]?.one ?? unit.name.toLowerCase();
}

export function unitMany(unit: Unit): string {
  return grammar[unit.id]?.many ?? unit.name.toLowerCase();
}

export function hasUnitGrammar(unit: Unit): boolean {
  return Object.prototype.hasOwnProperty.call(grammar, unit.id);
}

/** "one metre", "two metres", "0 metres" — never "one metres". */
export function quantityName(quantity: number, unit: Unit): string {
  return Math.abs(quantity - 1) < 1e-12 ? unitOne(unit) : unitMany(unit);
}

/** "a foot", "an inch", "a US gallon" — not a blind vowel test. */
export function unitArticle(unit: Unit): "a" | "an" {
  const name = unitOne(unit);
  if (/^US\b/.test(name)) return "a";
  if (/^hour\b/.test(name)) return "an";
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

export function withUnitArticle(unit: Unit): string {
  return `${unitArticle(unit)} ${unitOne(unit)}`;
}

/**
 * A heading label that keeps proper nouns (Celsius, US, British) intact while
 * lowercasing the common nouns that follow a sentence-initial unit.
 */
export function unitHeading(unit: Unit): string {
  const name = unit.name;
  if (/\(US\)$/.test(name)) {
    return `US ${name.replace(/ \(US\)$/, "").toLowerCase()}`;
  }
  if (name === "British thermal units") return name;
  if (name === "Celsius" || name === "Fahrenheit" || name === "Kelvin") return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

export function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
