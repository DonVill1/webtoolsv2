import type { ToolDefinition } from "../types";

const date = "2026-10-28";

export const converterTools: ToolDefinition[] = [
  {
    slug: "unit-converter",
    name: "Unit converter",
    category: "converters",
    intent: "convert between metric and imperial units",
    seo: {
      title: "Unit Converter — Length, Weight, Temperature & Data",
      description:
        "Convert length, weight, temperature, data, speed, area, volume, time, pressure and angle. Exact factors, a reference table and no sign-up.",
    },
    content: {
      intro:
        "One converter for the units you actually use, with the factor shown next to every result. Pick a category, type a value, and read the equivalent in every unit in that family at once.",
      howItWorks: [
        "Each unit is defined by its conversion factor to the category's base unit: metres for length, kilograms for weight, bytes for data, seconds for time. A conversion multiplies by the source factor and divides by the target factor in one step, so there is no chained rounding between intermediate units.",
        "Temperature is the exception. Celsius, Fahrenheit and Kelvin use offset formulas rather than a single multiplier, and each direction is applied explicitly. Data sizes offer both standards: SI (1 kB = 1,000 bytes) and IEC (1 KiB = 1,024 bytes), because most software labels the binary value as KB.",
      ],
      examples: [
        { input: "5 ft to in", output: "60 in", note: "1 ft = 12 in exactly" },
        { input: "5 km to mi", output: "3.106856 mi", note: "1 mi = 1.609344 km exactly" },
        { input: "100 °F to °C", output: "37.7778 °C", note: "(100 − 32) × 5/9" },
      ],
      limits:
        "Conversions only run within one family; metres to kilograms is rejected rather than guessed. Time uses the average Gregorian month (30.436875 days) and year (365.2425 days), labelled as averages because a calendar month is not a fixed duration.",
      faqs: [
        {
          q: "How accurate are the results?",
          a: "Factors are defined exactly wherever the standard defines them, and results are formatted to six significant figures. Copy gives the unrounded value, which matters when a result feeds another calculation. Temperature offsets are applied directly, not approximated.",
        },
        {
          q: "Why does 1 KB show two different values?",
          a: "Storage manufacturers use SI (1 kB = 1,000 bytes) while most operating systems display IEC binary sizes (1 KiB = 1,024 bytes) under the KB label. The converter exposes both, so you can choose the convention you need.",
        },
        {
          q: "Does it work offline?",
          a: "Yes. Every conversion runs in your browser and the page needs no network request after it loads. No value you type is sent anywhere.",
        },
      ],
    },
    related: ["percentage-calculator", "bmi-calculator", "text-converter"],
    og: { kicker: "Converters", value: "1 ft = 12 in" },
    status: "live",
    added: "2023-11-19",
    updated: date,
  },
  {
    slug: "base64-encoder",
    name: "Base64 encoder & decoder",
    category: "converters",
    intent: "encode files and decode Base64 text",
    seo: {
      title: "Base64 Encoder & Decoder — Text, Files, URL-safe",
      description:
        "Encode text or files to Base64 and decode Base64 text, including URL-safe input. Everything stays in your browser; nothing is uploaded.",
    },
    content: {
      intro:
        "Encode text or a local file to Base64, then decode Base64 back to UTF-8 text. URL-safe encoding is a toggle, and the byte count tells you exactly what the encoded string will weigh.",
      howItWorks: [
        "Base64 maps every three bytes to four ASCII characters. The browser's TextEncoder produces UTF-8 bytes first, so accented characters and emoji encode correctly instead of throwing. Decoding reverses the process, accepts standard or URL-safe input, and requires the decoded bytes to be valid UTF-8 text.",
        "URL-safe mode replaces + with - and / with _ and drops the padding, which is the variant used in JWTs and URLs. File mode reads the file through the local file input and never uploads it.",
      ],
      examples: [
        { input: "hello", output: "aGVsbG8=", note: "5 bytes → 8 characters" },
        { input: "✓", output: "4pyT", note: "UTF-8 is 3 bytes for this character" },
      ],
      limits:
        "Decoding returns text only; binary files cannot be reconstructed here. File input is capped at 4 MiB, and Base64 is not encryption — it provides no confidentiality.",
      faqs: [
        {
          q: "Is Base64 encryption?",
          a: "No. It is a reversible encoding. Anyone with the string can decode it, so never use it to protect a password, token or personal data.",
        },
        {
          q: "Why is the encoded text larger?",
          a: "Base64 represents 6 bits per character instead of 8, so the output is roughly 4/3 of the input size plus padding.",
        },
        {
          q: "Why did my decode fail?",
          a: "The input contains characters outside the Base64 alphabet, has invalid padding, or decodes to bytes that are not UTF-8. Binary payloads cannot be shown as text.",
        },
      ],
    },
    related: ["text-converter", "hash-generator", "json-validator"],
    og: { kicker: "Converters", value: "hello → aGVsbG8=" },
    status: "live",
    added: "2025-11-19",
    updated: date,
  },
  {
    slug: "text-converter",
    name: "Text format converter",
    category: "converters",
    intent: "convert markdown html json yaml csv and xml",
    seo: {
      title: "Text Converter — Markdown, HTML, JSON, YAML, CSV",
      description:
        "Convert JSON, YAML, CSV, XML, Markdown and HTML, or flatten to plain text. See the exact output and what is lost in each direction.",
    },
    content: {
      intro:
        "Move a document between the formats you actually paste into tickets, docs and config files. Choose the source and target explicitly; the output panel warns when a format cannot represent the same structure.",
      howItWorks: [
        "Structured formats are parsed into a JavaScript value, then written in the target syntax. JSON, YAML and CSV share that path, so key order and types survive where the target supports them. Markdown and HTML are converted through a renderer and a tag stripper.",
        "Plain text is a lossy destination by design: it keeps the words and drops structure. The output panel states when that has happened instead of pretending the round trip is lossless.",
      ],
      examples: [
        {
          input: "a,b\n1,2",
          output: '[{"a":"1","b":"2"}]',
          note: "CSV values are strings unless the target coerces them",
        },
        { input: "# Title", output: "<h1>Title</h1>", note: "Markdown level-one heading" },
      ],
      limits:
        "XML attributes are read but namespaces are not preserved. CSV has no type system, so every value arrives as a string. Markdown support covers CommonMark basics rather than extensions such as MDX or footnotes.",
      faqs: [
        {
          q: "Which direction is lossy?",
          a: "Anything to plain text loses structure. Markdown to HTML loses nothing important but cannot round-trip custom components. CSV loses types and nesting.",
        },
        {
          q: "Is my document uploaded?",
          a: "No. Parsing and conversion run in the browser tab. The page makes no network request with your content.",
        },
        {
          q: "Can it convert YAML anchors?",
          a: "Anchors and aliases are resolved during parsing, so the output is a plain expanded document. That is usually what you want for JSON, but it is not byte-identical YAML.",
        },
      ],
    },
    related: ["json-validator", "base64-encoder", "markdown-editor"],
    og: { kicker: "Converters", value: "CSV → JSON" },
    status: "live",
    added: "2023-10-15",
    updated: date,
  },
];
