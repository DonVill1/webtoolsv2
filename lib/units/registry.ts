/**
 * Unit registry — the single source of truth for conversion maths.
 *
 * Factors are written as exact decimals wherever the standard defines one
 * (1 in = 0.0254 m, 1 lb = 0.45359237 kg) and derived for the rest. Copy lives
 * in the CMS; numbers never do, so an editor cannot make a conversion wrong.
 */

export type UnitCategoryId =
  | "length"
  | "weight"
  | "temperature"
  | "data"
  | "speed"
  | "area"
  | "volume"
  | "time"
  | "pressure"
  | "energy"
  | "data-rate"
  | "angle";

export interface Unit {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  aliases: string[];
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  note?: string;
}

export interface UnitCategory {
  id: UnitCategoryId;
  name: string;
  slug: UnitCategoryId;
  base: string;
  /** Plural form used in prose and table headers. */
  basePlural: string;
  intro: string;
  units: Unit[];
  defaultFrom: string;
  defaultTo: string;
}

const linear = (id: string, slug: string, name: string, symbol: string, factor: number, aliases: string[] = [], note?: string): Unit => ({
  id,
  slug,
  name,
  symbol,
  aliases,
  toBase: (value) => value * factor,
  fromBase: (value) => value / factor,
  note,
});

const lengthUnits: Unit[] = [
  linear("mm", "millimetres", "Millimetres", "mm", 0.001, ["millimeter", "millimeters"]),
  linear("cm", "centimetres", "Centimetres", "cm", 0.01, ["centimeter", "centimeters"]),
  linear("m", "metres", "Metres", "m", 1, ["meter", "meters"]),
  linear("km", "kilometres", "Kilometres", "km", 1000, ["kilometer", "kilometers"]),
  linear("in", "inches", "Inches", "in", 0.0254, ["inch"]),
  linear("ft", "feet", "Feet", "ft", 0.3048, ["foot"]),
  linear("yd", "yards", "Yards", "yd", 0.9144, ["yard"]),
  linear("mi", "miles", "Miles", "mi", 1609.344, ["mile"]),
  linear("nmi", "nautical-miles", "Nautical miles", "nmi", 1852, ["nautical mile"]),
];

const weightUnits: Unit[] = [
  linear("mg", "milligrams", "Milligrams", "mg", 0.000001, ["milligram"]),
  linear("g", "grams", "Grams", "g", 0.001, ["gram"]),
  linear("kg", "kilograms", "Kilograms", "kg", 1, ["kilogram"]),
  linear("t", "tonnes", "Tonnes", "t", 1000, ["tonne", "metric ton", "metric tons"]),
  linear("oz", "ounces", "Ounces", "oz", 0.028349523125, ["ounce"]),
  linear("lb", "pounds", "Pounds", "lb", 0.45359237, ["pound", "lbs"]),
  linear("st", "stones", "Stones", "st", 6.35029318, ["stone"]),
];

const temperatureUnits: Unit[] = [
  {
    id: "c",
    slug: "celsius",
    name: "Celsius",
    symbol: "°C",
    aliases: ["centigrade"],
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  {
    id: "f",
    slug: "fahrenheit",
    name: "Fahrenheit",
    symbol: "°F",
    aliases: [],
    toBase: (value) => ((value - 32) * 5) / 9,
    fromBase: (value) => (value * 9) / 5 + 32,
  },
  {
    id: "k",
    slug: "kelvin",
    name: "Kelvin",
    symbol: "K",
    aliases: [],
    toBase: (value) => value - 273.15,
    fromBase: (value) => value + 273.15,
  },
];

const dataUnits: Unit[] = [
  linear("b", "bytes", "Bytes", "B", 1),
  linear("kb", "kilobytes", "Kilobytes", "kB", 1000, ["kilobyte"], "SI decimal: 1 kB = 1,000 bytes"),
  linear("mb", "megabytes", "Megabytes", "MB", 1e6, ["megabyte"], "SI decimal: 1 MB = 1,000 kB"),
  linear("gb", "gigabytes", "Gigabytes", "GB", 1e9, ["gigabyte"], "SI decimal: 1 GB = 1,000 MB"),
  linear("tb", "terabytes", "Terabytes", "TB", 1e12, ["terabyte"], "SI decimal: 1 TB = 1,000 GB"),
  linear("kib", "kibibytes", "Kibibytes", "KiB", 1024, ["kibibyte"], "IEC binary: 1 KiB = 1,024 bytes"),
  linear("mib", "mebibytes", "Mebibytes", "MiB", 1048576, ["mebibyte"], "IEC binary: 1 MiB = 1,024 KiB"),
  linear("gib", "gibibytes", "Gibibytes", "GiB", 1073741824, ["gibibyte"], "IEC binary: 1 GiB = 1,024 MiB"),
  linear("tib", "tebibytes", "Tebibytes", "TiB", 1099511627776, ["tebibyte"], "IEC binary: 1 TiB = 1,024 GiB"),
];

const speedUnits: Unit[] = [
  linear("mps", "metres-per-second", "Metres per second", "m/s", 1),
  linear("kmh", "kilometres-per-hour", "Kilometres per hour", "km/h", 1000 / 3600, ["kph", "kmph"]),
  linear("mph", "miles-per-hour", "Miles per hour", "mph", 0.44704),
  linear("fps", "feet-per-second", "Feet per second", "ft/s", 0.3048),
  linear("kn", "knots", "Knots", "kn", 1852 / 3600, ["knot"]),
];

const areaUnits: Unit[] = [
  linear("mm2", "square-millimetres", "Square millimetres", "mm²", 0.000001),
  linear("cm2", "square-centimetres", "Square centimetres", "cm²", 0.0001),
  linear("m2", "square-metres", "Square metres", "m²", 1, ["sqm", "square meters"]),
  linear("km2", "square-kilometres", "Square kilometres", "km²", 1e6),
  linear("in2", "square-inches", "Square inches", "in²", 0.00064516),
  linear("ft2", "square-feet", "Square feet", "ft²", 0.09290304, ["sqft"]),
  linear("yd2", "square-yards", "Square yards", "yd²", 0.83612736),
  linear("ac", "acres", "Acres", "ac", 4046.8564224, ["acre"]),
  linear("ha", "hectares", "Hectares", "ha", 10000, ["hectare"]),
];

const volumeUnits: Unit[] = [
  linear("ml", "millilitres", "Millilitres", "mL", 0.001, ["milliliter", "milliliters"]),
  linear("l", "litres", "Litres", "L", 1, ["liter", "liters"]),
  linear("m3", "cubic-metres", "Cubic metres", "m³", 1000),
  linear("gal", "gallons-us", "Gallons (US)", "gal", 3.785411784, ["gallon", "gallons"]),
  linear("qt", "quarts-us", "Quarts (US)", "qt", 0.946352946, ["quart", "quarts"]),
  linear("pt", "pints-us", "Pints (US)", "pt", 0.473176473, ["pint", "pints"]),
  linear("cup", "cups-us", "Cups (US)", "cup", 0.2365882365, ["cups"]),
  linear("floz", "fluid-ounces-us", "Fluid ounces (US)", "fl oz", 0.0295735295625, ["fl oz", "fluid ounce"]),
  linear("tbsp", "tablespoons-us", "Tablespoons (US)", "tbsp", 0.01478676478125),
  linear("tsp", "teaspoons-us", "Teaspoons (US)", "tsp", 0.00492892159375),
];

const timeUnits: Unit[] = [
  linear("ms", "milliseconds", "Milliseconds", "ms", 0.001, ["millisecond"]),
  linear("s", "seconds", "Seconds", "s", 1, ["second", "sec"]),
  linear("min", "minutes", "Minutes", "min", 60, ["minute"]),
  linear("h", "hours", "Hours", "h", 3600, ["hour", "hr", "hrs"]),
  linear("d", "days", "Days", "d", 86400, ["day"]),
  linear("wk", "weeks", "Weeks", "wk", 604800, ["week"]),
  linear("mo", "months", "Months (average)", "mo", 2629746, ["month"], "Average Gregorian month = 30.436875 days"),
  linear("yr", "years", "Years (average)", "yr", 31556952, ["year"], "Average Gregorian year = 365.2425 days"),
];

const pressureUnits: Unit[] = [
  linear("pa", "pascals", "Pascals", "Pa", 1, ["pascal"]),
  linear("kpa", "kilopascals", "Kilopascals", "kPa", 1000),
  linear("bar", "bar", "Bar", "bar", 100000),
  linear("psi", "psi", "Pounds per square inch", "psi", 6894.757293168, ["pounds per square inch"]),
  linear("atm", "atmospheres", "Atmospheres", "atm", 101325, ["atmosphere"]),
  linear("mmhg", "millimetres-of-mercury", "Millimetres of mercury", "mmHg", 133.322387415, ["torr"]),
];

const energyUnits: Unit[] = [
  linear("j", "joules", "Joules", "J", 1, ["joule"]),
  linear("kj", "kilojoules", "Kilojoules", "kJ", 1000),
  linear("cal", "calories", "Calories", "cal", 4.184, ["calorie"]),
  linear("kcal", "kilocalories", "Kilocalories", "kcal", 4184, ["kilocalorie", "food calorie"]),
  linear("wh", "watt-hours", "Watt-hours", "Wh", 3600),
  linear("kwh", "kilowatt-hours", "Kilowatt-hours", "kWh", 3600000),
  linear("btu", "btu", "British thermal units", "BTU", 1055.05585262),
];

const dataRateUnits: Unit[] = [
  linear("bps", "bits-per-second", "Bits per second", "bit/s", 1),
  linear("kbps", "kilobits-per-second", "Kilobits per second", "kbit/s", 1000),
  linear("mbps", "megabits-per-second", "Megabits per second", "Mbit/s", 1e6),
  linear("gbps", "gigabits-per-second", "Gigabits per second", "Gbit/s", 1e9),
  linear("kbyteps", "kilobytes-per-second", "Kilobytes per second", "kB/s", 8000),
  linear("mbyteps", "megabytes-per-second", "Megabytes per second", "MB/s", 8000000),
];

const angleUnits: Unit[] = [
  {
    id: "deg",
    slug: "degrees",
    name: "Degrees",
    symbol: "°",
    aliases: ["degree"],
    toBase: (value) => (value * Math.PI) / 180,
    fromBase: (value) => (value * 180) / Math.PI,
  },
  {
    id: "rad",
    slug: "radians",
    name: "Radians",
    symbol: "rad",
    aliases: ["radian"],
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  {
    id: "grad",
    slug: "gradians",
    name: "Gradians",
    symbol: "grad",
    aliases: ["gradian", "gon"],
    toBase: (value) => (value * Math.PI) / 200,
    fromBase: (value) => (value * 200) / Math.PI,
  },
  {
    id: "turn",
    slug: "turns",
    name: "Turns",
    symbol: "turn",
    aliases: ["turn", "revolution"],
    toBase: (value) => value * Math.PI * 2,
    fromBase: (value) => value / (Math.PI * 2),
  },
];

export const unitCategories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    slug: "length",
    base: "metre",
    basePlural: "metres",
    intro: "Metric and imperial lengths, from millimetres to nautical miles.",
    units: lengthUnits,
    defaultFrom: "m",
    defaultTo: "ft",
  },
  {
    id: "weight",
    name: "Weight",
    slug: "weight",
    base: "kilogram",
    basePlural: "kilograms",
    intro: "Mass in metric, imperial and avoirdupois units.",
    units: weightUnits,
    defaultFrom: "kg",
    defaultTo: "lb",
  },
  {
    id: "temperature",
    name: "Temperature",
    slug: "temperature",
    base: "degree Celsius",
    basePlural: "degrees Celsius",
    intro: "Celsius, Fahrenheit and Kelvin, using offset formulas rather than a single factor.",
    units: temperatureUnits,
    defaultFrom: "c",
    defaultTo: "f",
  },
  {
    id: "data",
    name: "Data size",
    slug: "data",
    base: "byte",
    basePlural: "bytes",
    intro: "SI decimal (kB) and IEC binary (KiB) sizes, kept separate instead of conflated.",
    units: dataUnits,
    defaultFrom: "mb",
    defaultTo: "gb",
  },
  {
    id: "speed",
    name: "Speed",
    slug: "speed",
    base: "metre per second",
    basePlural: "metres per second",
    intro: "Road, aviation and scientific speed units.",
    units: speedUnits,
    defaultFrom: "kmh",
    defaultTo: "mph",
  },
  {
    id: "area",
    name: "Area",
    slug: "area",
    base: "square metre",
    basePlural: "square metres",
    intro: "Land and surface areas, including acres and hectares.",
    units: areaUnits,
    defaultFrom: "m2",
    defaultTo: "ft2",
  },
  {
    id: "volume",
    name: "Volume",
    slug: "volume",
    base: "litre",
    basePlural: "litres",
    intro: "Metric volumes and US customary cooking measures.",
    units: volumeUnits,
    defaultFrom: "l",
    defaultTo: "gal",
  },
  {
    id: "time",
    name: "Time",
    slug: "time",
    base: "second",
    basePlural: "seconds",
    intro: "Durations from milliseconds to average Gregorian years.",
    units: timeUnits,
    defaultFrom: "h",
    defaultTo: "min",
  },
  {
    id: "pressure",
    name: "Pressure",
    slug: "pressure",
    base: "pascal",
    basePlural: "pascals",
    intro: "Bar, psi, atmospheres and the metric pressure units.",
    units: pressureUnits,
    defaultFrom: "bar",
    defaultTo: "psi",
  },
  {
    id: "energy",
    name: "Energy",
    slug: "energy",
    base: "joule",
    basePlural: "joules",
    intro: "Joules, calories, watt-hours and British thermal units.",
    units: energyUnits,
    defaultFrom: "kwh",
    defaultTo: "kj",
  },
  {
    id: "data-rate",
    name: "Data rate",
    slug: "data-rate",
    base: "bit per second",
    basePlural: "bits per second",
    intro: "Megabits per second against megabytes per second — the eight-times trap.",
    units: dataRateUnits,
    defaultFrom: "mbps",
    defaultTo: "mbyteps",
  },
  {
    id: "angle",
    name: "Angle",
    slug: "angle",
    base: "radian",
    basePlural: "radians",
    intro: "Degrees, radians, gradians and turns.",
    units: angleUnits,
    defaultFrom: "deg",
    defaultTo: "rad",
  },
];

export const categoryBySlug = new Map<string, UnitCategory>(
  unitCategories.map((category) => [category.slug, category]),
);
export const categoryById = new Map<string, UnitCategory>(
  unitCategories.map((category) => [category.id, category]),
);

const unitIndex = new Map<string, { unit: Unit; category: UnitCategory }>();
for (const category of unitCategories) {
  for (const unit of category.units) {
    if (unitIndex.has(unit.slug)) throw new Error(`Duplicate unit slug: ${unit.slug}`);
    unitIndex.set(unit.slug, { unit, category });
  }
}

export function findUnit(slug: string) {
  return unitIndex.get(slug);
}

export function getUnit(categoryId: UnitCategoryId, unitId: string): Unit {
  const category = categoryById.get(categoryId);
  if (!category) throw new Error(`Unknown category: ${categoryId}`);
  const unit = category.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Unknown unit ${unitId} in ${categoryId}`);
  return unit;
}

export function convertUnit(
  categoryId: UnitCategoryId,
  value: number,
  fromId: string,
  toId: string,
): number {
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  return to.fromBase(from.toBase(value));
}

export function formatNumber(value: number, precision = 6): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e12 || abs < 1e-6) return value.toExponential(4);

  const rounded = Number(value.toPrecision(precision));
  const [whole, fraction] = String(rounded).split(".");
  const grouped = Number(whole).toLocaleString("en-US");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function pairSlug(fromSlug: string, toSlug: string): string {
  return `${fromSlug}-to-${toSlug}`;
}

export function parsePair(slug: string): { from: Unit; to: Unit; category: UnitCategory } | null {
  const split = slug.split("-to-");
  if (split.length !== 2) return null;
  const from = findUnit(split[0] ?? "");
  const to = findUnit(split[1] ?? "");
  if (!from || !to) return null;
  if (from.category.id !== to.category.id) return null;
  return { from: from.unit, to: to.unit, category: from.category };
}

/** 60 curated, ordered pairs. The full matrix is never published. */
const curated: Array<[UnitCategoryId, string, string]> = [
  ["length", "ft", "in"],
  ["length", "in", "cm"],
  ["length", "m", "ft"],
  ["length", "km", "mi"],
  ["length", "mi", "km"],
  ["weight", "kg", "lb"],
  ["weight", "lb", "kg"],
  ["weight", "g", "oz"],
  ["weight", "oz", "g"],
  ["weight", "st", "lb"],
  ["temperature", "c", "f"],
  ["temperature", "f", "c"],
  ["temperature", "c", "k"],
  ["temperature", "k", "c"],
  ["temperature", "f", "k"],
  ["data", "mb", "gb"],
  ["data", "gb", "mb"],
  ["data", "kb", "mb"],
  ["data", "gb", "tb"],
  ["data", "mib", "gib"],
  ["speed", "kmh", "mph"],
  ["speed", "mph", "kmh"],
  ["speed", "kn", "mph"],
  ["speed", "mps", "kmh"],
  ["speed", "mph", "fps"],
  ["area", "ft2", "m2"],
  ["area", "m2", "ft2"],
  ["area", "ac", "ha"],
  ["area", "ha", "ac"],
  ["area", "m2", "yd2"],
  ["volume", "l", "gal"],
  ["volume", "gal", "l"],
  ["volume", "cup", "ml"],
  ["volume", "ml", "cup"],
  ["volume", "floz", "ml"],
  ["time", "h", "min"],
  ["time", "min", "h"],
  ["time", "d", "h"],
  ["time", "wk", "d"],
  ["time", "yr", "d"],
  ["pressure", "bar", "psi"],
  ["pressure", "psi", "bar"],
  ["pressure", "atm", "psi"],
  ["pressure", "kpa", "psi"],
  ["pressure", "bar", "kpa"],
  ["energy", "kj", "kcal"],
  ["energy", "kcal", "kj"],
  ["energy", "kwh", "kj"],
  ["energy", "cal", "j"],
  ["energy", "kwh", "btu"],
  ["data-rate", "mbps", "mbyteps"],
  ["data-rate", "mbyteps", "mbps"],
  ["data-rate", "gbps", "mbps"],
  ["data-rate", "mbps", "kbps"],
  ["data-rate", "mbps", "kbyteps"],
  ["angle", "deg", "rad"],
  ["angle", "rad", "deg"],
  ["angle", "deg", "grad"],
  ["angle", "grad", "deg"],
  ["angle", "turn", "deg"],
];

export interface ConversionPair {
  slug: string;
  href: string;
  category: UnitCategory;
  from: Unit;
  to: Unit;
  title: string;
  h1: string;
}

function buildPair(categoryId: UnitCategoryId, fromId: string, toId: string): ConversionPair {
  const category = categoryById.get(categoryId);
  if (!category) throw new Error(`Unknown category ${categoryId}`);
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  const slug = pairSlug(from.slug, to.slug);
  return {
    slug,
    href: `/convert/${category.slug}/${slug}`,
    category,
    from,
    to,
    title: `${from.name} to ${to.name.toLowerCase()}`,
    h1: `${from.name} to ${to.name.toLowerCase()} converter`,
  };
}

export const conversionPairs: ConversionPair[] = curated.map(([category, from, to]) =>
  buildPair(category, from, to),
);

export const pairBySlug = new Map(conversionPairs.map((pair) => [pair.slug, pair]));

export function pairsInCategory(categoryId: UnitCategoryId): ConversionPair[] {
  return conversionPairs.filter((pair) => pair.category.id === categoryId);
}

export function reversePair(pair: ConversionPair): ConversionPair | undefined {
  return pairBySlug.get(pairSlug(pair.to.slug, pair.from.slug));
}

/** Rows for the reference table on a conversion page. */
export function conversionTable(
  pair: ConversionPair,
  values: number[] = [1, 2, 3, 5, 10, 20, 25, 50, 100, 500, 1000],
): Array<{ input: number; output: number }> {
  return values.map((value) => ({
    input: value,
    output: convertUnit(pair.category.id, value, pair.from.id, pair.to.id),
  }));
}

export function formulaFor(pair: ConversionPair): string {
  const factor = convertUnit(pair.category.id, 1, pair.from.id, pair.to.id);
  if (pair.category.id === "temperature") {
    const formulas: Record<string, string> = {
      "c:f": "°F = (°C × 9/5) + 32",
      "f:c": "°C = (°F − 32) × 5/9",
      "c:k": "K = °C + 273.15",
      "k:c": "°C = K − 273.15",
      "f:k": "K = (°F − 32) × 5/9 + 273.15",
      "k:f": "°F = (K − 273.15) × 9/5 + 32",
    };
    return formulas[`${pair.from.id}:${pair.to.id}`] ?? "Temperature uses an offset formula.";
  }
  return `1 ${pair.from.symbol} = ${formatNumber(factor, 10)} ${pair.to.symbol}`;
}
