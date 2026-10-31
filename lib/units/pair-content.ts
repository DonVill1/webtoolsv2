import type { Faq, Guide } from "@/lib/content/types";
import { guideBySlug } from "@/lib/content/guides";
import {
  convertUnit,
  formatNumber,
  formulaFor,
  type ConversionPair,
  type UnitCategoryId,
} from "./registry";
import { quantityName, unitMany, unitOne } from "./grammar";

/**
 * Pair-page copy that is derived from the units themselves.
 *
 * The template stays the same, but every page gets two unit explanations, a
 * pair-specific factor derivation, a reverse answer and five FAQs built from
 * its own numbers. Nothing here is a hand-written paragraph repeated 60 times.
 */

/** The date the pair copy and factor explanations were last checked. */
export const PAIR_CONTENT_REVIEWED = "2026-10-28";

export interface CategoryCopy {
  measures: string;
  uses: string;
  precision: string;
  mistake: { title: string; body: string };
}

const categoryCopy: Record<UnitCategoryId, CategoryCopy> = {
  length: {
    measures:
      "Length measures one dimension: how far apart two points are. The metric units are powers of ten, while the imperial units are fixed fractions of a foot or a mile.",
    uses:
      "Length conversions show up in construction, travel, screen sizes, clothing, fitness and anything imported from a country that uses the other system.",
    precision:
      "The international yard and pound agreement of 1959 fixed the inch at exactly 0.0254 m, the foot at exactly 0.3048 m and the mile at exactly 1,609.344 m. Those definitions are exact; only the displayed result is rounded.",
    mistake: {
      title: "A foot is not 0.3 metres",
      body: "The shorthand 1 ft ≈ 0.3 m is fine for a rough estimate and wrong for a cut list. The exact factor is 0.3048, a difference of about 1.6% — enough to matter over a room or a sheet of material.",
    },
  },
  weight: {
    measures:
      "These units measure mass, not the force a scale feels. The distinction matters in physics and engineering; in everyday body-weight and shipping talk, “weight” means mass.",
    uses:
      "Mass conversions are used for body weight, recipes, parcel limits, luggage, freight and any label that switches between kilograms and pounds.",
    precision:
      "The international avoirdupois pound is exactly 0.45359237 kg and the ounce is exactly one sixteenth of that. The kilogram has been defined by the Planck constant since 2019, so the chain is exact at every step.",
    mistake: {
      title: "Mass is not weight",
      body: "A 70 kg person has the same mass on the Moon but a different weight. For everyday conversions the numbers are interchangeable; for physics problems the local gravitational acceleration belongs in the calculation.",
    },
  },
  temperature: {
    measures:
      "Temperature is a measure of average thermal energy. Celsius and Fahrenheit set different zero points and different degree sizes, so converting between them is not a single multiplication.",
    uses:
      "Temperature conversions are used in weather, cooking, medical readings, HVAC, laboratory work and any recipe or datasheet written in the other scale.",
    precision:
      "Celsius, Fahrenheit and Kelvin are related by affine formulas, not by a ratio. The fixed points are exact by definition, but a displayed value is rounded; the converter keeps the unrounded value between steps.",
    mistake: {
      title: "Do not multiply Celsius by a factor",
      body: "There is no “Celsius factor”. Fahrenheit and Celsius have different zero points and different degree sizes, so the offset has to be applied before and after the scale factor. Treating 20 °C as 20 × 1.8 = 36 °F is a common and very wrong shortcut.",
    },
  },
  data: {
    measures:
      "These units measure digital storage: the number of bytes a file, memory chip or disk holds. One byte is eight bits, but storage is usually quoted in bytes while network speed is quoted in bits.",
    uses:
      "Data-size conversions are used for file sizes, storage capacity, upload limits, memory specs and download estimates.",
    precision:
      "SI decimal units (kB, MB, GB) are powers of 1,000. IEC binary units (KiB, MiB, GiB) are powers of 1,024. Both definitions are exact; they are simply different units with confusingly similar names.",
    mistake: {
      title: "1,024 bytes is a kibibyte, not a kilobyte",
      body: "Many operating systems show binary sizes under the decimal label. A “1 TB” drive holds 1,000,000,000,000 bytes, which is about 931 GiB — not a shortfall in the drive, but a different unit on the label.",
    },
  },
  speed: {
    measures:
      "Speed is distance divided by time. The units differ in both the distance (kilometres, miles, nautical miles) and the time base (hours, seconds), so a single factor has to carry both.",
    uses:
      "Speed conversions are used for driving, aviation, marine navigation, running, cycling and wind or current forecasts.",
    precision:
      "The underlying length and time definitions are exact, so each factor is exact. A knot is exactly 1.852 km/h; a mile per hour is exactly 0.44704 m/s. Displayed values are rounded.",
    mistake: {
      title: "mph and km/h are not interchangeable",
      body: "A 100 km/h road limit is about 62 mph, not 100 mph. The gap is large enough that a driver switching mentally between the two can misjudge a limit or a speedometer.",
    },
  },
  area: {
    measures:
      "Area is a two-dimensional quantity: length multiplied by length. A square foot is a square whose sides are one foot, so the linear factor has to be squared, not reused.",
    uses:
      "Area conversions are used for property, land, flooring, roofing, paint coverage, gardens and construction materials.",
    precision:
      "Square units are exact squares of their linear definitions: one square foot is exactly 0.09290304 m², one acre is exactly 4,046.8564224 m² and one hectare is exactly 10,000 m².",
    mistake: {
      title: "Do not square the conversion by hand",
      body: "One metre is about 3.28 feet, but one square metre is about 10.76 square feet, not 3.28. Area factors are the square of the length factor, which is why the numbers look larger than expected.",
    },
  },
  volume: {
    measures:
      "Volume is three-dimensional space. The metric units are powers of a litre, while the US customary units are based on the US gallon, which is not the same as an imperial gallon.",
    uses:
      "Volume conversions are used for cooking, fuel, tank sizes, beverages, chemicals and any recipe that mixes cups, millilitres and fluid ounces.",
    precision:
      "The US liquid gallon is exactly 3.785411784 L, the US cup is exactly 8 US fluid ounces and the US fluid ounce is exactly 29.5735295625 mL. Those are exact definitions, not averages.",
    mistake: {
      title: "US and imperial gallons are different",
      body: "A US gallon is about 3.785 L; an imperial gallon is about 4.546 L, roughly 20% larger. A UK recipe or a car spec written in gallons is not necessarily using the same gallon as a US one.",
    },
  },
  time: {
    measures:
      "Time units measure duration. Fixed units such as seconds, minutes, hours and days have exact lengths; calendar units such as months and years do not, because their length changes.",
    uses:
      "Duration conversions are used for scheduling, travel, cooking, payroll, project planning and scientific work.",
    precision:
      "Seconds, minutes, hours, days and weeks are exact multiples of the second. The month and year in this converter are averages: 30.436875 days and 365.2425 days, labelled as averages everywhere they appear.",
    mistake: {
      title: "A month is not 30 days",
      body: "A calendar month is 28 to 31 days, so 30 days is only an approximation. The converter uses the average Gregorian month and says so; using that figure for a contract deadline is a category error, not a rounding issue.",
    },
  },
  pressure: {
    measures:
      "Pressure is force per unit area. The units come from different reference systems: pascals from SI, bar from meteorology and engineering, psi from US customary practice, and atmospheres from a standard reference pressure.",
    uses:
      "Pressure conversions are used for tyres, hydraulics, weather, diving, compressed gas, HVAC and any gauge or datasheet with a different unit.",
    precision:
      "One bar is exactly 100,000 Pa and one standard atmosphere is exactly 101,325 Pa. The psi factor is derived from the exact pound and inch definitions, so it is exact as well; display is rounded.",
    mistake: {
      title: "Gauge pressure and absolute pressure differ",
      body: "A tyre gauge usually reads pressure above ambient, while an absolute pressure includes the atmosphere. A gauge reading of 2 bar is about 3 bar absolute at sea level — the conversion factor is the same, but the quantity is not.",
    },
  },
  energy: {
    measures:
      "Energy is the capacity to do work. The units come from mechanics (joules), food (calories and kilocalories), electricity (watt-hours) and heating (BTU).",
    uses:
      "Energy conversions are used for nutrition labels, electricity bills, heating and cooling, batteries, engines and any datasheet that mixes joules, calories and watt-hours.",
    precision:
      "The thermochemical calorie is exactly 4.184 J and the kilocalorie is exactly 4,184 J. The watt-hour is exactly 3,600 J. The international table BTU is about 1,055.06 J; other BTU definitions differ slightly, so the definition matters.",
    mistake: {
      title: "A food Calorie is a kilocalorie",
      body: "The “Calories” on a nutrition label are kilocalories: 1 food Calorie = 1,000 small calories = 4.184 kJ. A 200-calorie snack is 200 kcal, not 200 cal. The capital C is doing a lot of work.",
    },
  },
  "data-rate": {
    measures:
      "Data rate measures how much data moves per second. Network speeds are usually quoted in bits per second, while file sizes are usually quoted in bytes — and one byte is eight bits.",
    uses:
      "Data-rate conversions are used for broadband plans, download estimates, video bitrates, network equipment and any spec sheet that mixes Mbit/s and MB/s.",
    precision:
      "The SI prefixes are powers of 1,000, so 1 Mbit/s is exactly 1,000,000 bit/s. A megabyte per second is exactly 8,000,000 bit/s. The factor of eight is not a rounding convention; it comes from the byte definition.",
    mistake: {
      title: "The 8× trap: Mbit/s versus MB/s",
      body: "A 100 Mbit/s connection downloads at about 12.5 MB/s, not 100 MB/s. Browser download counters usually show bytes, while the ISP advertises bits — the eight-times gap explains most “my connection is slower than advertised” confusion.",
    },
  },
  angle: {
    measures:
      "Angle measures rotation. Degrees divide a turn into 360 parts, radians use the arc length of a unit circle, and gradians divide a turn into 400 parts.",
    uses:
      "Angle conversions are used in geometry, navigation, surveying, computer graphics, astronomy and any tool with a degree/radian switch.",
    precision:
      "A turn is exactly 360 degrees, 2π radians and 400 gradians. Because π is irrational, a degree-to-radian value cannot be written as an exact finite decimal; the converter keeps the full floating-point value and rounds only for display.",
    mistake: {
      title: "Check the mode before trusting the number",
      body: "A calculator or plotting library set to radians will interpret 90 as 90 radians, not 90 degrees. The conversion is simple; forgetting which mode the tool is in is the usual failure.",
    },
  },
};

/** One or two sentences about a specific unit, used on its pair pages. */
const unitContext: Record<string, string> = {
  ft: "The international foot is exactly 0.3048 m, a definition agreed in 1959. It is 12 inches, or one third of a yard.",
  in: "The inch is exactly 0.0254 m, so there are exactly 12 inches in a foot. Customary woodworking still divides the inch into halves, quarters, eighths and sixteenths.",
  cm: "The centimetre (centimeter in US spelling) is one hundredth of a metre and is the unit most metric rulers are marked in. It is exactly 10 millimetres.",
  m: "The metre (meter in US spelling) is the SI base unit of length. Since 1983 it has been defined by the speed of light in vacuum, not by a physical bar.",
  km: "The kilometre (kilometer in US spelling) is 1,000 m and is the standard road-distance unit in most countries. A 5 km run is 5,000 m, or about 3.107 miles.",
  mi: "The international mile is exactly 1,609.344 m, or 5,280 feet. It is the road-distance unit in the United States and the United Kingdom.",
  kg: "The kilogram is the SI base unit of mass. Since 2019 it has been defined by the Planck constant rather than the international prototype.",
  lb: "The international avoirdupois pound is exactly 0.45359237 kg, or 16 ounces. It is the everyday body-weight and grocery unit in the United States.",
  g: "The gram is one thousandth of a kilogram. The kilogram, not the gram, is the SI base unit, which is why large masses are usually written in kg.",
  oz: "The avoirdupois ounce is exactly 28.349523125 g and is one sixteenth of a pound. The troy ounce used for precious metals is a different unit.",
  st: "The stone is 14 pounds, or 6.35029318 kg. It is still used for body weight in the UK and Ireland, even though official trade uses kilograms.",
  c: "Celsius puts 0 °C at the freezing point of water and 100 °C at its boiling point at one standard atmosphere. It is the everyday scale in most of the world.",
  f: "Fahrenheit puts 32 °F at water's freezing point and 212 °F at its boiling point at one standard atmosphere. It is the everyday scale in the United States.",
  k: "Kelvin is the SI base unit of thermodynamic temperature. 0 K is absolute zero and 273.15 K is 0 °C; the degree size is the same as Celsius.",
  kb: "The kilobyte is 1,000 bytes under SI. A kibibyte (KiB) is 1,024 bytes, which is why the two labels diverge in software.",
  mb: "The megabyte is 1,000,000 bytes under SI. A mebibyte (MiB) is 1,048,576 bytes, about 4.9% larger.",
  gb: "The gigabyte is 1,000 MB under SI. A gibibyte (GiB) is 1,024 MiB, about 7.4% larger.",
  tb: "The terabyte is 1,000 GB under SI. A tebibyte (TiB) is 1,024 GiB, so a “1 TB” drive shows about 931 GiB in binary-based software.",
  mib: "The mebibyte is an IEC binary unit equal to 1,024 KiB, or 1,048,576 bytes. It exists to remove the ambiguity of “megabyte”.",
  gib: "The gibibyte is an IEC binary unit equal to 1,024 MiB, or 1,073,741,824 bytes. It is common in memory and storage specs.",
  kmh: "Kilometres per hour (kilometers per hour in US spelling) is the road-speed unit in most countries. 100 km/h is about 62.1 mph, so a 100 km/h limit is not a 100 mph limit.",
  mph: "Miles per hour is the road-speed unit in the United States and the United Kingdom. 60 mph is about 96.6 km/h.",
  kn: "One knot is one nautical mile per hour, exactly 1.852 km/h. It is the standard speed unit in aviation and marine navigation because it matches nautical charts.",
  mps: "Metres per second (meters per second in US spelling) is the SI unit of speed. 1 m/s is exactly 3.6 km/h, which makes it a useful bridge between scientific and road-speed units.",
  fps: "Feet per second is used in engineering, ballistics and some sports. One foot per second is exactly 0.3048 m/s.",
  ft2: "The square foot is 144 square inches, or exactly 0.09290304 m². It is the usual floor-area unit in US and UK property listings.",
  m2: "The square metre (square meter in US spelling) is the SI unit of area. One square metre is about 10.764 square feet, not 3.28.",
  ac: "The international acre is 4,046.8564224 m², or 43,560 square feet. It is still used for land in the US and UK.",
  ha: "The hectare is 10,000 m², or about 2.471 acres. It is the common unit for land and agriculture in metric countries.",
  yd2: "The square yard is 9 square feet, or exactly 0.83612736 m². Carpet and landscaping materials are often quoted in square yards.",
  l: "The litre (liter in US spelling) is one cubic decimetre, or 0.001 m³. It is used for fluids, fuel, beverages and engine displacement.",
  gal: "The US liquid gallon is exactly 3.785411784 L. The imperial gallon is 4.54609 L, about 20% larger, so a US and a UK gallon are not interchangeable.",
  cup: "The US customary cup is 8 US fluid ounces, or about 236.588 mL. Metric cups are 250 mL and US legal cups are 240 mL, so recipes can differ by a few percent.",
  ml: "The millilitre (milliliter in US spelling) is one thousandth of a litre, or one cubic centimetre. It is the usual unit on medicine and kitchen measures.",
  floz: "The US fluid ounce is about 29.5735 mL. The imperial fluid ounce is about 28.4131 mL, so a UK recipe ounce is not a US one.",
  h: "The hour is 60 minutes, or 3,600 seconds. It is not an SI unit, but it is accepted for use with the SI.",
  min: "The minute is 60 seconds. The symbol is min, never “m”, which is the metre.",
  d: "The day is 86,400 seconds in this converter. A civil day can be 23 or 25 hours around a daylight-saving change, which is a calendar effect, not a conversion factor.",
  wk: "The week is seven days, or 604,800 seconds. It is a calendar convention rather than an SI unit.",
  yr: "The average Gregorian year is 365.2425 days, or 31,556,952 seconds. A calendar year is 365 or 366 days, so the average is labelled as an average.",
  bar: "One bar is exactly 100,000 Pa, close to one atmosphere (101,325 Pa). It is common in meteorology, diving and engineering.",
  psi: "One pound per square inch is about 6,894.76 Pa. It is the common tyre, hydraulic and compressed-air unit in the United States.",
  atm: "One standard atmosphere is exactly 101,325 Pa. It is a reference pressure used for physical properties, not a reading from a particular day.",
  kpa: "The kilopascal is 1,000 Pa. Metric tyre pressures are often given in kPa or bar, and 100 kPa is exactly 1 bar.",
  kj: "The kilojoule is 1,000 J. Food labels in many countries give energy in both kJ and kcal.",
  kcal: "The kilocalorie is exactly 4,184 J. The “calorie” on a food label is this unit, not the small calorie.",
  kwh: "The kilowatt-hour is exactly 3,600,000 J. It is the energy a 1 kW load uses for one hour, which is why electricity bills use it.",
  cal: "The thermochemical calorie is exactly 4.184 J. The food Calorie is a kilocalorie, 1,000 times larger, which is the single most common energy-unit confusion.",
  j: "The joule is the SI unit of energy, equal to one newton-metre. It is also the unit of work and heat.",
  btu: "The international table BTU is about 1,055.06 J. Other BTU definitions differ slightly, so a heating spec should say which one it uses.",
  mbps: "One megabit per second is 1,000,000 bit/s, or 0.125 MB/s. Broadband plans are usually sold in Mbit/s.",
  mbyteps: "One megabyte per second is 8,000,000 bit/s, eight times a megabit per second. Download counters usually show this unit.",
  gbps: "One gigabit per second is 1,000 Mbit/s, or 125 MB/s. It is common for fibre links and internal networks.",
  kbps: "One kilobit per second is 1,000 bit/s. Dial-up modems topped out at 56 kbit/s, so kbit/s is now mostly a low-bandwidth or audio-bitrate unit.",
  kbyteps: "One kilobyte per second is 8,000 bit/s, or 8 kbit/s. It is a small unit by modern broadband standards.",
  deg: "A degree is 1/360 of a full turn. The symbol ° is a degree sign, not a superscript zero.",
  rad: "A radian is the angle subtended by an arc equal in length to the radius. A full turn is 2π radians, or about 6.2832.",
  grad: "A gradian is 1/400 of a full turn, so 100 grad is a right angle. Surveying instruments sometimes use it.",
  turn: "One turn is 360 degrees, 2π radians or 400 gradians. It is the cleanest way to express a full rotation.",
};

const categoryGuide: Partial<Record<UnitCategoryId, string>> = {
  length: "km-to-miles",
  weight: "kg-to-lb",
  temperature: "celsius-to-fahrenheit",
  data: "kb-vs-kib",
  speed: "km-to-miles",
  "data-rate": "mbps-vs-mbs",
};

const pairGuideOverrides: Record<string, string> = {
  "feet-to-inches": "feet-to-inches-exact-factor",
  "inches-to-centimetres": "feet-to-inches-exact-factor",
  "centimetres-to-feet": "feet-to-inches-exact-factor",
  "feet-to-metres": "feet-to-inches-exact-factor",
  "metres-to-feet": "feet-to-inches-exact-factor",
};

export function categoryContent(category: UnitCategoryId): CategoryCopy {
  return categoryCopy[category];
}

export function unitExplanation(unitId: string): string | undefined {
  return unitContext[unitId];
}

export function pairGuide(pair: ConversionPair): Guide | undefined {
  const slug = pairGuideOverrides[pair.slug] ?? categoryGuide[pair.category.id];
  return guideBySlug.get(slug ?? "how-we-test-conversions");
}

/** A direct answer for the top of the page, before the converter. */
export function pairQuickAnswer(pair: ConversionPair): { value: string; detail: string } {
  const factor = convertUnit(pair.category.id, 1, pair.from.id, pair.to.id);
  const reverse = convertUnit(pair.category.id, 1, pair.to.id, pair.from.id);

  if (pair.category.id === "temperature") {
    return {
      value: `1 ${pair.from.symbol} = ${formatNumber(factor, 8)} ${pair.to.symbol}`,
      detail: `Going the other way, 1 ${pair.to.symbol} = ${formatNumber(reverse, 8)} ${pair.from.symbol}. Temperature uses an offset as well as a scale factor, so the two directions are not reciprocals.`,
    };
  }

  return {
    value: `One ${unitOne(pair.from)} = ${formatNumber(factor, 8)} ${quantityName(factor, pair.to)}`,
    detail: `Going the other way, one ${unitOne(pair.to)} = ${formatNumber(reverse, 8)} ${quantityName(reverse, pair.from)}. The converter keeps the unrounded value and rounds only the number it displays.`,
  };
}

/** The pair-specific arithmetic behind the factor. */
export function pairDerivation(pair: ConversionPair): string {
  if (pair.category.id === "temperature") {
    return `The converter first converts ${pair.from.symbol} to Celsius, the base for this family, then applies the ${pair.to.symbol} formula. The offset is applied once, not treated as a multiplication.`;
  }

  const fromBase = pair.from.toBase(1);
  const toBase = pair.to.toBase(1);
  return `One ${unitOne(pair.from)} is ${formatNumber(fromBase, 10)} ${
    pair.category.basePlural
  }. One ${unitOne(pair.to)} is ${formatNumber(toBase, 10)} ${
    pair.category.basePlural
  }. Dividing ${formatNumber(fromBase, 10)} by ${formatNumber(toBase, 10)} gives ${formatNumber(
    fromBase / toBase,
    10,
  )}, which is the one-step factor used above.`;
}

/** Five page-specific FAQs. Grammar is built from the unit registry, not guessed. */
export function pairFaqs(pair: ConversionPair): Faq[] {
  const factor = convertUnit(pair.category.id, 1, pair.from.id, pair.to.id);
  const reverse = convertUnit(pair.category.id, 1, pair.to.id, pair.from.id);
  const copy = categoryCopy[pair.category.id];
  const fromOne = unitOne(pair.from);
  const fromMany = unitMany(pair.from);
  const toOne = unitOne(pair.to);
  const toMany = unitMany(pair.to);
  const isTemperature = pair.category.id === "temperature";

  const first: Faq = isTemperature
    ? {
        q: `What is 1 ${pair.from.symbol} in ${pair.to.symbol}?`,
        a: `1 ${pair.from.symbol} equals ${formatNumber(factor, 8)} ${pair.to.symbol}. ${copy.precision}`,
      }
    : {
        q: `How many ${toMany} are in one ${fromOne}?`,
        a: `One ${fromOne} equals ${formatNumber(factor, 8)} ${quantityName(factor, pair.to)}. ${copy.precision}`,
      };

  const second: Faq = isTemperature
    ? {
        q: `What is 1 ${pair.to.symbol} in ${pair.from.symbol}?`,
        a: `1 ${pair.to.symbol} equals ${formatNumber(reverse, 8)} ${pair.from.symbol}. The offset makes this a separate formula, not the reciprocal of the first answer.`,
      }
    : {
        q: `How many ${fromMany} are in one ${toOne}?`,
        a: `One ${toOne} equals ${formatNumber(reverse, 8)} ${quantityName(reverse, pair.from)}. That is the reverse direction; the converter applies the same exact definitions in the opposite order.`,
      };

  const third: Faq = {
    q: `What is the formula for converting ${fromMany} to ${toMany}?`,
    a: isTemperature
      ? `${formulaFor(pair)}. Apply the offset before the scale factor; do not multiply the starting temperature by the factor alone.`
      : `${formulaFor(pair)}. Multiply the number of ${fromMany} by ${formatNumber(
          factor,
          10,
        )}; to go back, multiply the number of ${toMany} by ${formatNumber(reverse, 10)}.`,
  };

  const fourth: Faq = {
    q: isTemperature
      ? `Is the ${pair.from.symbol} to ${pair.to.symbol} conversion exact?`
      : `Is the ${fromOne}-to-${toOne} conversion exact?`,
    a: copy.precision,
  };

  const sampleValue = 10;
  const fifth: Faq = {
    q: `What is ${sampleValue} ${fromMany} in ${toMany}?`,
    a: `${sampleValue} ${fromMany} equals ${formatNumber(
      convertUnit(pair.category.id, sampleValue, pair.from.id, pair.to.id),
      8,
    )} ${toMany}. The same factor applies to any value; the converter keeps the unrounded result for the next step.`,
  };

  return [first, second, third, fourth, fifth];
}
