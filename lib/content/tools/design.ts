import type { ToolDefinition } from "../types";

const date = "2026-10-28";

export const designTools: ToolDefinition[] = [
  {
    slug: "color-palette-generator",
    name: "Color palette generator",
    category: "design",
    intent: "generate harmonious color palettes from a base color",
    seo: {
      title: "Color Palette Generator — Harmonies & Export",
      description:
        "Generate complementary, analogous, triadic, split-complementary, tint and shade palettes from any base colour. Copy the hex or export CSS variables.",
    },
    content: {
      intro:
        "Start from one colour and get six useful palettes, with two to four swatches each. Click a swatch to use it as the new base, copy the hex, export CSS variables, or check the contrast.",
      howItWorks: [
        "The base is parsed as sRGB and converted to HSL. Harmonies rotate the hue by fixed angles: complementary 180°, analogous ±30°, triadic ±120°, split-complementary 150° and 210°. Tints and shades vary lightness instead.",
        "Each swatch keeps the base saturation and, except for tints and shades, the base lightness. Hex values are exact sRGB; the HSL readout describes the current base.",
      ],
      examples: [
        { input: "#1B4B8F, complementary", output: "#8F5F1B", note: "hue +180°" },
        { input: "#1B4B8F, triadic", output: "#8F1B47 and #478F1B", note: "±120°" },
      ],
      limits:
        "Harmonies are generated in sRGB, not in a perceptual space such as OKLCH, so two mathematically related hues can look uneven in brightness. The contrast checker reports WCAG ratios but does not repair a failing palette.",
      faqs: [
        {
          q: "Which harmony should I start with?",
          a: "Analogous palettes are the safest for interfaces; complementary pairs give the strongest contrast and need a neutral to avoid vibration. Triadic palettes are livelier but harder to balance.",
        },
        {
          q: "Can I export the palette?",
          a: "Yes. Copy the base hex or a CSS block of custom properties for all six palettes. Clicking a swatch makes it the new base, and the export uses the values shown on screen.",
        },
        {
          q: "Is the contrast check accessible?",
          a: "It reports the WCAG contrast ratio for a text/background pair. Passing 4.5:1 is the AA threshold for normal text; 3:1 is used for large text and non-text UI.",
        },
      ],
    },
    related: ["image-compressor", "svg-editor", "text-converter"],
    og: { kicker: "Design & media", value: "6 palettes · CSS export" },
    status: "live",
    added: "2023-04-20",
    updated: date,
  },
  {
    slug: "image-compressor",
    name: "Image compressor",
    category: "design",
    intent: "compress jpeg png and webp images without uploading",
    seo: {
      title: "Image Compressor — JPEG, PNG and WebP",
      description:
        "Compress JPEG, PNG, WebP and AVIF images to JPEG or WebP in your browser, compare the byte counts, and download the result. Nothing is uploaded.",
    },
    content: {
      intro:
        "Reduce an image's file size locally with a quality slider and an optional maximum dimension, then compare the exact byte counts before downloading.",
      howItWorks: [
        "The image is decoded, drawn to a canvas at the target dimensions, and re-encoded with the browser's encoder. Quality maps to the encoder's own scale, so the same value can produce a different size in Chrome and Safari.",
        "PNG input is decoded and offered as JPEG or WebP output; the browser cannot write a smaller PNG here. WebP preserves transparency, while JPEG flattens it onto white. Both respond to quality and dimensions.",
      ],
      examples: [
        { input: "2.4 MB JPEG, quality 0.75", output: "680 KB", note: "about 72% smaller" },
        { input: "3000 px wide, max 1600 px", output: "1600 px wide", note: "dimension cap applied" },
      ],
      limits:
        "Metadata such as EXIF and colour profiles is not preserved. The result is only as good as the browser's encoder, and repeated compression degrades quality, so always start from the original.",
      faqs: [
        {
          q: "Is my image uploaded?",
          a: "No. Decoding, resizing and encoding all happen in the browser with canvas. The file never leaves the device.",
        },
        {
          q: "Why did my image get larger after compression?",
          a: "A lossy re-encode can be larger than an already optimized original. Lower the quality, reduce the maximum width, or keep the original; this page does not write PNG output.",
        },
        {
          q: "What quality should I use?",
          a: "0.75–0.85 is a good starting point for photographs on the web. Below 0.6, banding and blocking become visible in gradients and skin tones.",
        },
      ],
    },
    related: ["color-palette-generator", "svg-editor", "qr-code-generator"],
    og: { kicker: "Design & media", value: "before → after bytes" },
    status: "live",
    added: "2023-04-10",
    updated: date,
  },
  {
    slug: "svg-editor",
    name: "SVG editor",
    category: "design",
    intent: "edit and preview svg markup",
    seo: {
      title: "SVG Editor — Edit and Preview Markup",
      description:
        "Edit SVG markup and preview it live, catch malformed markup, then copy or download the result. Runs in the browser with no upload.",
    },
    content: {
      intro:
        "A focused editor for SVG source: paste or write markup, see it render immediately, and get a clear error when the XML is malformed.",
      howItWorks: [
        "The markup is parsed with DOMParser before it is rendered, so a missing closing tag is reported as a parse error instead of disappearing into a blank preview. Valid markup is inlined into the preview area.",
        "The editor shows element and path counts, which is a quick way to confirm that a pasted icon is the shape you expected rather than an empty group.",
      ],
      examples: [
        {
          input: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>',
          output: "1 element · 1 shape",
        },
      ],
      limits:
        "This is a source editor, not a drawing application: there are no handles, layers or boolean operations. Scripts inside SVG markup are not executed in the preview.",
      faqs: [
        {
          q: "Is the SVG uploaded?",
          a: "No. Parsing and preview happen in the browser. Scripts and external references are not fetched by the preview.",
        },
        {
          q: "Why is my SVG blank?",
          a: "Usually a missing viewBox, a zero width or height, or a fill that matches the background. The element count will show whether anything parsed at all.",
        },
        {
          q: "Can I optimise the output?",
          a: "This editor does not run an optimiser. Removing editor metadata and rounding path coordinates by hand is still the most reliable reduction for small icons.",
        },
      ],
    },
    related: ["image-compressor", "color-palette-generator", "base64-encoder"],
    og: { kicker: "Design & media", value: "source → render" },
    status: "live",
    added: "2023-11-01",
    updated: date,
  },
];
