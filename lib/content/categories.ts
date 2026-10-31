import type { Category, ToolCategoryId } from "./types";

export const categories: Category[] = [
  {
    id: "converters",
    name: "Converters",
    slug: "converters",
    code: "CV",
    intro:
      "Units, encodings and file formats, converted with the factor shown next to the answer.",
    description:
      "Free unit, Base64 and text-format converters with exact factors, reference tables and no sign-up.",
  },
  {
    id: "calculators",
    name: "Calculators",
    slug: "calculators",
    code: "CA",
    intro: "Everyday arithmetic and health numbers, worked through rather than guessed.",
    description:
      "Percentage, BMI and date calculators with the formula, the rounding rule and a worked example on every page.",
  },
  {
    id: "developers",
    name: "Developer tools",
    slug: "developers",
    code: "DV",
    intro: "JSON, tokens, hashes, identifiers and timestamps. Everything runs in the browser.",
    description:
      "JSON validation, UUID, JWT, hash, timestamp, diff and password tools for developers. No upload, no sign-up.",
  },
  {
    id: "design",
    name: "Design & media",
    slug: "design",
    code: "DS",
    intro: "Colour maths, image compression and vector editing without an account.",
    description:
      "Colour palette generation, browser image compression and SVG editing. Your files never leave the device.",
  },
  {
    id: "text",
    name: "Text & time",
    slug: "text",
    code: "TX",
    intro: "Placeholder copy, sample data, reading statistics and time-zone planning.",
    description:
      "Lorem ipsum, test data, Markdown, text analysis and a time-zone meeting planner — all client-side.",
  },
  {
    id: "network",
    name: "Network & system",
    slug: "network",
    code: "NW",
    intro: "What the network and the device are actually doing, measured rather than estimated.",
    description:
      "DNS lookup, IP lookup, a browser speed test and a system report. Server routes are cached and disclosed.",
  },
];

export const categoryById = new Map(categories.map((category) => [category.id, category]));

export function getCategory(id: ToolCategoryId): Category {
  const category = categoryById.get(id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}
