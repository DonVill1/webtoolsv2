import { unitCategories } from "@/lib/units/registry";

/**
 * The tab sets a tool can show.
 *
 * These live outside the components so the page can render the tab links on the
 * server (crawlable, no JavaScript needed to see them) while the tool island
 * reads the same definition to decide which panel to show. `hint` becomes the
 * link title, so a tab carries the phrase someone would search for.
 */
export interface ToolView {
  id: string;
  label: string;
  hint: string;
}

export interface ToolViewSet {
  /** Query parameter that carries the active view. */
  param: string;
  /** Accessible name for the tab list. */
  label: string;
  views: readonly ToolView[];
  fallback: string;
}

const unitViews: readonly ToolView[] = unitCategories.map((category) => ({
  id: category.slug,
  label: category.name,
  hint: `${category.name} converter`,
}));

const percentageViews: readonly ToolView[] = [
  { id: "of", label: "X% of Y", hint: "Percentage of a number calculator" },
  { id: "is", label: "X is what % of Y", hint: "What percent calculator" },
  { id: "change", label: "% change", hint: "Percentage change calculator" },
  { id: "adjust", label: "Increase / decrease", hint: "Percentage increase and decrease calculator" },
  { id: "discount", label: "Discount", hint: "Discount calculator" },
  { id: "markup", label: "Markup", hint: "Markup calculator" },
];

const bmiViews: readonly ToolView[] = [
  { id: "metric", label: "Metric (cm / kg)", hint: "Metric BMI calculator" },
  { id: "imperial", label: "Imperial (ft / lb)", hint: "Imperial BMI calculator" },
];

const base64Views: readonly ToolView[] = [
  { id: "encode", label: "Encode", hint: "Base64 encoder" },
  { id: "decode", label: "Decode", hint: "Base64 decoder" },
];

const hashViews: readonly ToolView[] = [
  { id: "sha256", label: "SHA-256", hint: "SHA-256 hash generator" },
  { id: "sha512", label: "SHA-512", hint: "SHA-512 hash generator" },
  { id: "sha384", label: "SHA-384", hint: "SHA-384 hash generator" },
  { id: "sha1", label: "SHA-1", hint: "SHA-1 hash generator" },
];

const qrViews: readonly ToolView[] = [
  { id: "url", label: "URL", hint: "URL QR code generator" },
  { id: "text", label: "Text", hint: "Text QR code generator" },
  { id: "wifi", label: "Wi-Fi", hint: "Wi-Fi QR code generator" },
  { id: "vcard", label: "vCard", hint: "vCard QR code generator" },
];

const systemInfoViews: readonly ToolView[] = [
  { id: "general", label: "General", hint: "Browser and device information" },
  { id: "display", label: "Display", hint: "Screen and display information" },
  { id: "graphics", label: "Graphics", hint: "WebGL and graphics information" },
  { id: "network", label: "Network", hint: "Browser network information" },
  { id: "storage", label: "Storage & time", hint: "Storage, time zone and locale information" },
];

const textConverterViews: readonly ToolView[] = [
  { id: "json-yaml", label: "JSON → YAML", hint: "JSON to YAML converter" },
  { id: "yaml-json", label: "YAML → JSON", hint: "YAML to JSON converter" },
  { id: "json-csv", label: "JSON → CSV", hint: "JSON to CSV converter" },
  { id: "csv-json", label: "CSV → JSON", hint: "CSV to JSON converter" },
  { id: "xml-json", label: "XML → JSON", hint: "XML to JSON converter" },
  { id: "markdown-html", label: "Markdown → HTML", hint: "Markdown to HTML converter" },
];

export const toolViewSets: Record<string, ToolViewSet> = {
  "unit-converter": {
    param: "category",
    label: "Measurement category",
    views: unitViews,
    fallback: "length",
  },
  "percentage-calculator": {
    param: "mode",
    label: "Calculation type",
    views: percentageViews,
    fallback: "of",
  },
  "bmi-calculator": {
    param: "units",
    label: "Unit system",
    views: bmiViews,
    fallback: "metric",
  },
  "base64-encoder": {
    param: "mode",
    label: "Direction",
    views: base64Views,
    fallback: "encode",
  },
  "hash-generator": {
    param: "algorithm",
    label: "Hash algorithm",
    views: hashViews,
    fallback: "sha256",
  },
  "qr-code-generator": {
    param: "type",
    label: "Code content type",
    views: qrViews,
    fallback: "url",
  },
  "system-info": {
    param: "section",
    label: "System information section",
    views: systemInfoViews,
    fallback: "general",
  },
  "text-converter": {
    param: "pair",
    label: "Common conversions",
    views: textConverterViews,
    fallback: "json-yaml",
  },
};

export function hasToolViews(slug: string): boolean {
  return slug in toolViewSets;
}
