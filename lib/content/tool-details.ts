import type { Faq } from "./types";

/**
 * Tool-page depth that is not part of the tool definition itself: the direct
 * answer, a reference table, common mistakes, sources and two extra FAQs.
 *
 * Kept separate from the tool registry so the registry stays about identity
 * and routing. The content contract test fails if a live tool is missing here.
 */

export interface ToolReference {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface ToolSource {
  label: string;
  href: string;
}

export interface ToolDetail {
  answer: string;
  reference: ToolReference;
  mistakes: string[];
  sources: ToolSource[];
  extraFaqs: Faq[];
  /** Optional contextual links into the conversion pages. */
  conversions?: Array<{ label: string; href: string }>;
}

/** The date every tool-page answer, table and source was last checked. */
export const TOOL_DETAIL_REVIEWED = "2026-10-28";

export const toolDetails: Record<string, ToolDetail> = {
  "unit-converter": {
    answer:
      "One foot is exactly 12 inches and one inch is exactly 25.4 mm. Enter a value above and the converter multiplies once by the unit's exact definition, so the result does not drift through an intermediate unit.",
    reference: {
      caption: "Exact factors worth memorising",
      columns: ["Conversion", "Exact value", "Note"],
      rows: [
        ["1 inch", "25.4 mm", "International inch, exact"],
        ["1 foot", "0.3048 m", "12 inches, exact"],
        ["1 pound", "0.45359237 kg", "Avoirdupois pound, exact"],
        ["1 US gallon", "3.785411784 L", "US liquid gallon, exact"],
        ["0 °C", "32 °F", "Offset, not a multiplier"],
        ["1 KiB", "1,024 B", "IEC binary; 1 kB = 1,000 B"],
      ],
    },
    mistakes: [
      "Multiplying by a rounded factor such as 0.3 for a foot and then converting again. The error compounds; use the exact 0.3048 in one step.",
      "Treating a US gallon and an imperial gallon as the same unit. They differ by about 20%, which is enough to ruin a recipe or a fuel calculation.",
    ],
    sources: [
      { label: "NIST SP 811 — Guide for the Use of the SI", href: "https://www.nist.gov/pml/special-publication-811" },
      { label: "BIPM — SI Brochure", href: "https://www.bipm.org/en/publications/si-brochure" },
    ],
    conversions: [
      { label: "Feet to inches", href: "/convert/length/feet-to-inches" },
      { label: "Kilometres to miles", href: "/convert/length/kilometres-to-miles" },
      { label: "Kilograms to pounds", href: "/convert/weight/kilograms-to-pounds" },
      { label: "Celsius to Fahrenheit", href: "/convert/temperature/celsius-to-fahrenheit" },
      { label: "Megabytes to gigabytes", href: "/convert/data/megabytes-to-gigabytes" },
      { label: "Mbit/s to MB/s", href: "/convert/data-rate/megabits-per-second-to-megabytes-per-second" },
    ],
    extraFaqs: [
      {
        q: "How many feet are in a metre?",
        a: "One metre is 3.280839895 feet, because one foot is exactly 0.3048 m. The converter applies 1 ÷ 0.3048 directly rather than using the rounded 3.28.",
      },
      {
        q: "Is a US gallon the same as an imperial gallon?",
        a: "No. A US liquid gallon is exactly 3.785411784 L; an imperial gallon is exactly 4.54609 L, about 20% larger. The converter labels the US unit explicitly.",
      },
    ],
  },

  "base64-encoder": {
    answer:
      "Base64 turns three bytes into four printable characters, so a 1,000-byte file becomes 1,336 characters including padding. This encoder handles UTF-8 text and local files up to 4 MiB; decoding returns UTF-8 text, not a binary download.",
    reference: {
      caption: "Base64 size at a glance",
      columns: ["Input", "Base64 output", "Overhead"],
      rows: [
        ["1 byte", "4 characters", "2 padding characters"],
        ["2 bytes", "4 characters", "1 padding character"],
        ["3 bytes", "4 characters", "none"],
        ["4 bytes", "8 characters", "one extra group"],
        ["1 KiB (1,024 B)", "1,368 characters", "4/3 expansion"],
        ["1 MiB (1,048,576 B)", "1,398,104 characters", "4/3 expansion"],
      ],
    },
    mistakes: [
      "Using Base64 as encryption. Anyone can decode it without a key; it protects nothing and should never hold a password or a secret.",
      "Trying to decode a PNG or PDF as text. The decoded bytes must be valid UTF-8; binary payloads are rejected by the text decoder.",
    ],
    sources: [{ label: "RFC 4648 — Base64 and Base64URL", href: "https://www.rfc-editor.org/rfc/rfc4648" }],
    extraFaqs: [
      {
        q: "How do I encode a file?",
        a: "Choose a file up to 4 MiB in encode mode. The browser reads it locally and returns the Base64 string; the file is never uploaded to a server.",
      },
      {
        q: "Can I decode a PNG or PDF here?",
        a: "No. Decoding is limited to UTF-8 text so the result can be shown and copied. Use a binary-aware decoder if you need to reconstruct a file.",
      },
    ],
  },

  "text-converter": {
    answer:
      "JSON to YAML, CSV to JSON and Markdown to HTML are the reliable directions. Plain text is a one-way destination: it keeps the words and drops headings, keys and nesting.",
    reference: {
      caption: "What survives each direction",
      columns: ["Direction", "Preserved", "Lost or changed"],
      rows: [
        ["JSON → YAML", "Keys, nesting, scalar types", "Key order is not a contract"],
        ["YAML → JSON", "Mappings, sequences, scalars", "Anchors resolve to expanded values"],
        ["CSV → JSON", "Rows and column names", "Every value becomes a string"],
        ["Markdown → HTML", "Headings, lists, links, code", "Custom components and MDX"],
        ["HTML → text", "Words", "All structure and links"],
        ["XML → JSON", "Elements and attributes", "Namespaces and mixed content flatten"],
      ],
    },
    mistakes: [
      "Assuming every pair is reversible. HTML to Markdown is not offered; HTML converts to plain text, and CSV loses types and nesting.",
      "Renaming a .json5 or .jsonc file to .json. Comments and trailing commas are still invalid JSON and will fail in a real parser.",
    ],
    sources: [
      { label: "CommonMark specification", href: "https://spec.commonmark.org/" },
      { label: "YAML 1.2.2 specification", href: "https://yaml.org/spec/1.2.2/" },
      { label: "RFC 4180 — CSV format", href: "https://www.rfc-editor.org/rfc/rfc4180" },
    ],
    extraFaqs: [
      {
        q: "Can I convert HTML back to Markdown?",
        a: "No. The converter supports Markdown to HTML and HTML to plain text, but not HTML to Markdown. The output panel reports the unsupported direction.",
      },
      {
        q: "Does YAML to JSON preserve comments?",
        a: "No. Comments are not part of the parsed data model, so they are dropped. Anchors and aliases are expanded into their values rather than copied.",
      },
    ],
  },

  "percentage-calculator": {
    answer:
      "15% of 240 is 36; a change from 40 to 52 is +30%; 20% off 80 is 64. The calculator shows the substituted formula for each mode so the base is never ambiguous.",
    reference: {
      caption: "Six percentage questions, worked",
      columns: ["Question", "Working", "Answer"],
      rows: [
        ["15% of 240", "0.15 × 240", "36"],
        ["48 is what % of 240", "48 ÷ 240 × 100", "20%"],
        ["40 → 52", "(52 − 40) ÷ 40 × 100", "+30%"],
        ["20% off 80", "80 × 0.80", "64"],
        ["20% markup on 80", "80 × 1.20", "96"],
        ["10% → 12%", "(12 − 10) ÷ 10 × 100", "+20% (2 points)"],
      ],
    },
    mistakes: [
      "Adding percentages instead of compounding them. A 20% rise followed by a 20% fall leaves 96, not 100, because each percentage uses a different base.",
      "Confusing percentage points with percent change. Going from 10% to 12% is 2 points but a 20% relative increase; the working line shows both.",
    ],
    sources: [{ label: "Wolfram MathWorld — Percentage", href: "https://mathworld.wolfram.com/Percentage.html" }],
    extraFaqs: [
      {
        q: "How do I calculate a discount?",
        a: "Final price = original × (1 − discount ÷ 100). The discount mode uses 80 × 0.80 = 64 for 20% off 80 and shows the substituted expression.",
      },
      {
        q: "How do I calculate markup?",
        a: "Selling price = cost × (1 + markup ÷ 100). A 20% markup on 80 is 96. Markup is based on cost; margin is based on the selling price.",
      },
    ],
  },

  "bmi-calculator": {
    answer:
      "BMI is kilograms divided by metres squared. At 180 cm and 75 kg it is 23.1, inside the WHO adult range of 18.5–24.9; the same page shows the healthy weight range for that height.",
    reference: {
      caption: "Healthy weight range by height (WHO adult BMI 18.5–24.9)",
      columns: ["Height", "At BMI 18.5", "At BMI 24.9"],
      rows: [
        ["160 cm", "47.4 kg", "63.7 kg"],
        ["170 cm", "53.5 kg", "72.0 kg"],
        ["180 cm", "59.9 kg", "80.7 kg"],
        ["190 cm", "66.8 kg", "89.9 kg"],
      ],
    },
    mistakes: [
      "Applying adult BMI bands to children or teenagers. Paediatric BMI is interpreted against age- and sex-specific percentiles, not the fixed adult cut-offs.",
      "Treating BMI as a measure of body fat. A muscular athlete can have a high BMI with low fat mass; waist circumference or body composition adds context.",
    ],
    sources: [
      {
        label: "WHO — Obesity and overweight fact sheet",
        href: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
      },
    ],
    conversions: [
      { label: "Kilograms to pounds", href: "/convert/weight/kilograms-to-pounds" },
      { label: "Pounds to kilograms", href: "/convert/weight/pounds-to-kilograms" },
      { label: "Stones to pounds", href: "/convert/weight/stones-to-pounds" },
    ],
    extraFaqs: [
      {
        q: "What is the BMI formula in pounds and inches?",
        a: "BMI = 703 × pounds ÷ inches². It is the same formula as kilograms divided by metres squared; the 703 factor carries the unit conversion.",
      },
      {
        q: "Does BMI work for children?",
        a: "No. Children and teenagers use age- and sex-specific BMI percentiles. The adult 18.5–24.9 range on this page applies only to adults.",
      },
    ],
  },

  "birthday-countdown": {
    answer:
      "The countdown targets local midnight on the next occurrence of your birth month and day. A 29 February birthday falls on 1 March in common years, and the page says so when that happens.",
    reference: {
      caption: "How the countdown resolves edge cases",
      columns: ["Situation", "Result"],
      rows: [
        ["Birthday later this year", "Counts to this year's date"],
        ["Birthday already passed", "Counts to next year's date"],
        ["29 February in a common year", "Targets 1 March"],
        ["Birthday is today", "0 days; age updates today"],
        ["Different device time zones", "Each device counts to its own local midnight"],
      ],
    },
    mistakes: [
      "Assuming a year is always 365 days. Ages are counted in calendar years, so leap years and the birthday's position in the year both matter.",
      "Comparing countdowns across devices in different time zones. The target is local midnight where the page is open, not a fixed UTC instant.",
    ],
    sources: [{ label: "IANA — Time Zone Database", href: "https://www.iana.org/time-zones" }],
    extraFaqs: [
      {
        q: "How is the age calculated?",
        a: "The calculator subtracts the birth year from the year of the next birthday. It counts calendar years, not blocks of 365 days, and updates on the birthday itself.",
      },
      {
        q: "Why does the countdown change at midnight?",
        a: "The target is midnight in the device's local time zone. Daylight-saving changes are applied by the browser, so the number of hours can shift on a transition day.",
      },
    ],
  },

  "json-validator": {
    answer:
      "JSON uses double quotes, no comments and no trailing commas. A trailing comma after the last member fails at the comma, and this page reports the line and column instead of a generic parse error.",
    reference: {
      caption: "JSON rules and parser behaviour",
      columns: ["Input", "Result", "Why"],
      rows: [
        ['{"a":1,}', "Error at the comma", "Trailing commas are invalid"],
        ['{"a":1,"a":2}', "Valid; last value wins", "Duplicate names are not rejected"],
        ["{a: 1}", "Error", "Keys need double quotes"],
        ["9007199254740993", "Rounded when parsed", "Beyond 2^53 − 1"],
        ['{"a":1} // note', "Error", "Comments are not JSON"],
      ],
    },
    mistakes: [
      "Adding a trailing comma because JavaScript accepts it. JSON does not; the file will fail in every strict parser even if a linter forgives it.",
      "Sending a 64-bit ID as a JSON number. JavaScript rounds integers above 2^53 − 1, so the value can change before your code sees it. Send it as a string.",
    ],
    sources: [
      { label: "RFC 8259 — JSON data interchange format", href: "https://www.rfc-editor.org/rfc/rfc8259" },
      { label: "ECMA-404 — JSON syntax", href: "https://ecma-international.org/publications-and-standards/standards/ecma-404/" },
    ],
    extraFaqs: [
      {
        q: "Does this validate against a JSON Schema?",
        a: "No. It checks JSON syntax only. Schema validation requires the schema document and a separate validator that understands the draft version.",
      },
      {
        q: "Why did a large integer change value?",
        a: "JavaScript numbers are IEEE-754 doubles. Integers above 9,007,199,254,740,991 lose precision when parsed; keep the exact digits as a string if they matter.",
      },
    ],
  },

  "uuid-generator": {
    answer:
      "A version-4 UUID is 122 random bits written as 32 hex digits with hyphens. This generator makes up to 100 per run from the browser's cryptographic source; it does not create sequential or time-ordered IDs.",
    reference: {
      caption: "UUID versions at a glance",
      columns: ["Identifier", "Bits / shape", "Use"],
      rows: [
        ["UUID v4", "122 random bits", "This generator"],
        ["UUID v7", "48-bit timestamp + random", "Time-ordered keys"],
        ["UUID v5", "128-bit SHA-1 name hash", "Deterministic names"],
        ["Nil UUID", "All zeroes", "Sentinel, not random"],
        ["Max UUID", "All ones", "Sentinel, not random"],
      ],
    },
    mistakes: [
      "Using a random v4 UUID as a clustered database key. Random inserts fragment the index; a time-ordered UUID v7 is usually better for write-heavy tables.",
      "Assuming a UUID is a security token. It is an identifier with 122 random bits, but it is not a secret and should not authorise access on its own.",
    ],
    sources: [{ label: "RFC 9562 — UUIDs", href: "https://www.rfc-editor.org/rfc/rfc9562" }],
    extraFaqs: [
      {
        q: "How many UUIDs can I generate at once?",
        a: "Up to 100 per run. Generating in bulk does not reduce the randomness of any individual identifier; each one is drawn independently.",
      },
      {
        q: "Are these UUIDs cryptographically secure?",
        a: "They come from crypto.randomUUID or crypto.getRandomValues, not Math.random. A v4 UUID has 122 random bits, which is sufficient for identifiers.",
      },
    ],
  },

  "jwt-decoder": {
    answer:
      "A JWT is three Base64URL segments: header, payload and signature. This page decodes the first two and shows exp, iat and nbf as dates; it never verifies the signature, so a decoded token is not a trusted token.",
    reference: {
      caption: "Registered JWT claims this page reads",
      columns: ["Claim", "Meaning", "Format"],
      rows: [
        ["iss", "Issuer", "String"],
        ["sub", "Subject", "String"],
        ["aud", "Audience", "String or array"],
        ["exp", "Expiration time", "Seconds since epoch"],
        ["nbf", "Not before", "Seconds since epoch"],
        ["iat", "Issued at", "Seconds since epoch"],
      ],
    },
    mistakes: [
      "Trusting a decoded payload. Decoding proves only that the segment is Base64URL JSON; it says nothing about who signed it or whether the signature is valid.",
      "Treating exp as milliseconds. JWT NumericDate values are seconds since 1970; multiply by 1000 only when constructing a JavaScript Date.",
    ],
    sources: [{ label: "RFC 7519 — JSON Web Token", href: "https://www.rfc-editor.org/rfc/rfc7519" }],
    extraFaqs: [
      {
        q: "Can I verify a signature here?",
        a: "No. Verification needs the issuer's key and an explicit algorithm policy. Use a server-side JWT library rather than a browser decoder for that decision.",
      },
      {
        q: "Why does exp look like a number?",
        a: "JWT NumericDate is seconds since the Unix epoch. The decoder converts it to an ISO date and a UTC string; the raw seconds remain in the payload.",
      },
    ],
  },

  "hash-generator": {
    answer:
      "A SHA-256 digest is 64 hexadecimal characters. The same bytes always produce the same digest, but a hash is not encryption, and these unsalted hashes are not suitable for storing passwords.",
    reference: {
      caption: "Digest sizes offered",
      columns: ["Algorithm", "Digest", "Hex characters", "Status"],
      rows: [
        ["SHA-1", "160 bits", "40", "Broken for collision resistance"],
        ["SHA-256", "256 bits", "64", "Recommended default"],
        ["SHA-384", "384 bits", "96", "Stronger, longer"],
        ["SHA-512", "512 bits", "128", "Strongest offered"],
      ],
    },
    mistakes: [
      "Using SHA-1 for signatures or certificates. Collisions are practical; choose SHA-256 or stronger for any security-related integrity check.",
      "Hashing passwords with a plain digest. Fast hashes are cheap to brute-force; passwords need a salted, memory-hard function such as Argon2, scrypt or bcrypt.",
    ],
    sources: [
      { label: "NIST — Secure Hash Standard (FIPS 180-4)", href: "https://www.nist.gov/publications/secure-hash-standard" },
    ],
    extraFaqs: [
      {
        q: "Does changing one character change the digest?",
        a: "Yes. A cryptographic hash has an avalanche effect: one changed byte produces an unrelated digest, which is what makes it useful for integrity checks.",
      },
      {
        q: "Why do two hashes of the same text match?",
        a: "The digest is deterministic over the UTF-8 bytes. The same text with the same encoding always produces the same hexadecimal output, on any device.",
      },
    ],
  },

  "timestamp-converter": {
    answer:
      "Unix time counts seconds since 1970-01-01T00:00:00Z and ignores leap seconds. Choose seconds or milliseconds explicitly, then read the ISO 8601, UTC and local renderings side by side.",
    reference: {
      caption: "Common Unix timestamps",
      columns: ["Timestamp", "UTC date", "Note"],
      rows: [
        ["0", "1970-01-01T00:00:00Z", "Unix epoch"],
        ["1,000,000,000", "2001-09-09T01:46:40Z", "One billion seconds"],
        ["1,767,225,600", "2026-01-01T00:00:00Z", "Start of 2026"],
        ["2,147,483,647", "2038-01-19T03:14:07Z", "Signed 32-bit maximum"],
        ["4,102,444,800", "2100-01-01T00:00:00Z", "Start of 2100"],
      ],
    },
    mistakes: [
      "Mixing seconds and milliseconds. A seconds value multiplied by 1000 becomes milliseconds; passing seconds where milliseconds are expected lands in 1970.",
      "Expecting Unix time to count leap seconds. It counts 86,400 seconds per day, so it is not an SI-second stopwatch and can drift from UTC by a second.",
    ],
    sources: [
      { label: "RFC 3339 — Date and time on the Internet", href: "https://www.rfc-editor.org/rfc/rfc3339" },
      { label: "IANA — Time Zone Database", href: "https://www.iana.org/time-zones" },
    ],
    extraFaqs: [
      {
        q: "How do I convert a date to a timestamp?",
        a: "For a UTC date, use Math.floor(Date.parse('2026-10-27T00:00:00Z') / 1000). Local dates need an explicit offset, because the same wall-clock time maps to different instants.",
      },
      {
        q: "What is the 2038 problem?",
        a: "Many systems store Unix time in a signed 32-bit integer, which overflows on 2038-01-19T03:14:07Z. Use 64-bit values or a date type for anything beyond that date.",
      },
    ],
  },

  "diff-checker": {
    answer:
      "A diff marks removed lines with − and added lines with +. This is a line-based longest-common-subsequence comparison, so a single changed word marks the whole line; each side is capped at 2,000 lines.",
    reference: {
      caption: "How to read the output",
      columns: ["Marker", "Meaning"],
      rows: [
        ["− (minus)", "Line exists in the original only"],
        ["+ (plus)", "Line exists in the changed text only"],
        ["blank", "Unchanged context line"],
        ["2,000 lines", "Maximum per side"],
        ["Collapse spaces", "Runs of spaces collapse and ends trim"],
      ],
    },
    mistakes: [
      "Expecting character-level precision. A one-word edit replaces the whole line, which is correct for a line diff but coarse for prose review.",
      "Turning on whitespace collapsing globally when indentation matters. It collapses runs of spaces and trims both sides, not just trailing whitespace.",
    ],
    sources: [{ label: "Myers (1986) — An O(ND) difference algorithm", href: "https://doi.org/10.1007/BF01840446" }],
    extraFaqs: [
      {
        q: "Is the diff character-level?",
        a: "No. It compares whole lines. A changed word marks that line as removed and the replacement line as added, with unchanged lines kept as context.",
      },
      {
        q: "How large can the inputs be?",
        a: "Each side is limited to 2,000 lines. The limit keeps the quadratic comparison responsive; split larger files or compare sections instead.",
      },
    ],
  },

  "password-generator": {
    answer:
      "A 20-character password drawn from all four sets here (86 possible characters) has about 129 bits of entropy. Length buys more strength than adding symbols, and the password is generated locally with crypto.getRandomValues.",
    reference: {
      caption: "Entropy at 86 possible characters",
      columns: ["Length", "Entropy", "Strength label"],
      rows: [
        ["12", "≈ 77 bits", "Strong"],
        ["16", "≈ 103 bits", "Very strong"],
        ["20", "≈ 129 bits", "Very strong"],
        ["24", "≈ 154 bits", "Very strong"],
        ["32", "≈ 206 bits", "Very strong"],
      ],
    },
    mistakes: [
      "Reusing a strong password across sites. One breach exposes every account; uniqueness matters as much as entropy.",
      "Adding symbol sets instead of length. A longer password from a smaller alphabet often beats a short password from a larger one, and it is easier to type.",
    ],
    sources: [
      {
        label: "NIST SP 800-63B — Digital identity guidelines",
        href: "https://pages.nist.gov/800-63-4/sp800-63b.html",
      },
    ],
    extraFaqs: [
      {
        q: "Is 16 characters enough?",
        a: "Sixteen characters from the full 86-character set is about 103 bits, which is strong for most accounts. Use 20 or more for high-value credentials.",
      },
      {
        q: "Should I use a passphrase instead?",
        a: "Both can be strong. A random password has more entropy per character; a passphrase is easier to type and remember. Use whichever your password manager supports.",
      },
    ],
  },

  "qr-code-generator": {
    answer:
      "A QR code stores the data directly, so it never expires and never redirects. Choose error correction M for most uses, H for small or damaged placements, then download SVG for print or PNG for screens.",
    reference: {
      caption: "QR capacity at error-correction level M",
      columns: ["Version", "Modules", "Byte capacity"],
      rows: [
        ["1", "21 × 21", "14 bytes"],
        ["2", "25 × 25", "26 bytes"],
        ["3", "29 × 29", "42 bytes"],
        ["4", "33 × 33", "62 bytes"],
        ["10", "57 × 57", "213 bytes"],
        ["40", "177 × 177", "2,331 bytes"],
      ],
    },
    mistakes: [
      "Printing the code too small for its module count. Keep at least four modules of quiet margin and test the printed size with a phone before a full run.",
      "Choosing level H for every code. Higher correction survives more damage but reduces capacity and increases module density, which can make a long URL harder to scan.",
    ],
    sources: [{ label: "Denso Wave — QR Code essentials", href: "https://www.qrcode.com/en/about/" }],
    extraFaqs: [
      {
        q: "What is the difference between SVG and PNG?",
        a: "SVG is vector and scales without blurring, so it is the right choice for print. PNG is raster at the selected pixel size, which is convenient for slides and screens.",
      },
      {
        q: "How much data can a QR code hold?",
        a: "Up to about 2,331 bytes at level M in version 40, depending on the content mode. A short URL scans more reliably than a long block of text.",
      },
    ],
  },

  "color-palette-generator": {
    answer:
      "A complementary palette rotates the hue by 180°, analogous by ±30° and triadic by ±120°. This page generates six palettes from one hex value and reports the WCAG contrast of the base colour on white and black.",
    reference: {
      caption: "The six palettes and their hue maths",
      columns: ["Palette", "Hue rotation", "Colours shown"],
      rows: [
        ["Complementary", "+180°", "Base + opposite"],
        ["Analogous", "−30° / +30°", "Three adjacent hues"],
        ["Triadic", "+120° / +240°", "Three evenly spaced"],
        ["Split complement", "+150° / +210°", "Base + two near-opposites"],
        ["Tints", "Lightness 92 / 78 / 64", "Four lighter steps"],
        ["Shades", "Lightness −12 / −24 / −36", "Four darker steps"],
      ],
    },
    mistakes: [
      "Assuming HSL rotation is perceptually even. Two hues at the same saturation and lightness can look very different in brightness; check the result rather than trusting the angle.",
      "Checking contrast only against white. A colour that passes on white can fail on black; the page reports both ratios and the better text colour.",
    ],
    sources: [
      {
        label: "W3C — WCAG 2.2 contrast minimum",
        href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
      },
    ],
    extraFaqs: [
      {
        q: "What is a split-complementary palette?",
        a: "It uses the base colour plus the two hues at ±150° from it. It keeps the tension of a complement but gives two related accents instead of one.",
      },
      {
        q: "How is the contrast ratio calculated?",
        a: "WCAG uses relative luminance: (lighter + 0.05) ÷ (darker + 0.05). A ratio of 4.5:1 is the AA threshold for normal text; 3:1 is used for large text.",
      },
    ],
  },

  "image-compressor": {
    answer:
      "Compression happens in the browser: the image is decoded, optionally resized, and re-encoded as JPEG or WebP. The byte count before and after is exact, and the original file is never uploaded.",
    reference: {
      caption: "Input formats and output behaviour",
      columns: ["Input", "Output options", "What quality does"],
      rows: [
        ["JPEG", "JPEG, WebP", "Controls lossy compression"],
        ["PNG", "JPEG, WebP", "PNG is decoded; output is lossy"],
        ["WebP", "JPEG, WebP", "Re-encodes; alpha kept only in WebP"],
        ["AVIF", "JPEG, WebP", "Decoded if the browser supports it"],
        ["Max width", "320–4,000 px", "Downscales; never upscales"],
      ],
    },
    mistakes: [
      "Recompressing an already compressed file repeatedly. Each lossy pass adds artifacts; always start from the original and export once.",
      "Expecting a PNG download. This page accepts PNG input but exports JPEG or WebP; choose WebP when you need transparency preserved.",
    ],
    sources: [{ label: "MDN — Canvas API", href: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API" }],
    conversions: [
      { label: "Megabytes to gigabytes", href: "/convert/data/megabytes-to-gigabytes" },
      { label: "Gigabytes to megabytes", href: "/convert/data/gigabytes-to-megabytes" },
    ],
    extraFaqs: [
      {
        q: "Does this preserve EXIF data?",
        a: "No. Re-encoding through a canvas drops EXIF, colour profiles and other metadata. Keep the original if those fields matter.",
      },
      {
        q: "Can I output PNG?",
        a: "No. The encoder offers JPEG and WebP. PNG input is decoded and can be resized, but the output is always one of those two lossy formats.",
      },
    ],
  },

  "svg-editor": {
    answer:
      "An SVG is valid only when the XML parses and the root element is <svg>. This editor reports malformed tags before rendering, then shows the element count, canvas size and minified byte size.",
    reference: {
      caption: "Why an SVG preview can fail",
      columns: ["Symptom", "Likely cause"],
      rows: [
        ["Blank preview", "Missing or zero width/height, or fill matches background"],
        ["Malformed XML", "Unclosed tag or unquoted attribute"],
        ["Root element error", "Document does not start with <svg>"],
        ["Wrong canvas size", "Missing viewBox and no width/height"],
        ["Unexpected file size", "Editor metadata or long decimal paths"],
      ],
    },
    mistakes: [
      "Leaving out the viewBox. Width and height alone make the image scale badly; a viewBox defines the coordinate system the artwork was drawn in.",
      "Assuming the preview executes scripts. The SVG is rendered through an image element, so scripts and external references do not run.",
    ],
    sources: [{ label: "MDN — SVG reference", href: "https://developer.mozilla.org/en-US/docs/Web/SVG" }],
    extraFaqs: [
      {
        q: "What does the shape count include?",
        a: "It counts path, rect, circle, ellipse, line, polyline and polygon elements. Text is counted separately; groups and defs are not shapes and do not inflate the figure.",
      },
      {
        q: "Does the preview run scripts?",
        a: "No. The preview renders through an image element, which blocks scripts. Inline CSS animations and fonts behave as they would in an image, not on the page.",
      },
    ],
  },

  "dns-lookup": {
    answer:
      "An A record maps a name to an IPv4 address; AAAA does the same for IPv6. Choose one record type at a time, and read the TTL to know how long a resolver may keep the answer cached.",
    reference: {
      caption: "DNS record types this page queries",
      columns: ["Record", "Answers", "Typical use"],
      rows: [
        ["A", "IPv4 address", "Website host"],
        ["AAAA", "IPv6 address", "IPv6 host"],
        ["MX", "Mail exchanger + priority", "Email routing"],
        ["TXT", "Arbitrary text", "SPF, DKIM, verification"],
        ["NS", "Authoritative nameservers", "Delegation"],
        ["CNAME", "Canonical name", "Alias"],
        ["SOA", "Zone authority", "Serial, refresh, retry"],
        ["CAA", "Permitted CAs", "Certificate issuance"],
      ],
    },
    mistakes: [
      "Judging propagation from one resolver. Each resolver caches for the TTL, so two locations can legitimately disagree until the old answer expires.",
      "Changing a record without lowering the TTL first. The old value can stay cached for the previous TTL, which makes a migration look broken.",
    ],
    sources: [
      { label: "RFC 1035 — Domain names and DNS", href: "https://www.rfc-editor.org/rfc/rfc1035" },
      { label: "RFC 8484 — DNS over HTTPS", href: "https://www.rfc-editor.org/rfc/rfc8484" },
    ],
    extraFaqs: [
      {
        q: "What is a CNAME record?",
        a: "A CNAME points one name at another canonical name. It cannot coexist with most other records at the same name, so a host that needs both a website and mail usually uses A/AAAA records instead.",
      },
      {
        q: "What does MX priority mean?",
        a: "Lower numbers are tried first. A mail exchanger with priority 10 is preferred over one with priority 20, and the second is a fallback if the first is unavailable.",
      },
    ],
  },

  "ip-lookup": {
    answer:
      "An IP lookup maps an address to the network that announces it, then to an approximate location. Country is usually reliable; city is inferred from the ISP's allocation and can be wrong for VPNs and mobile carriers.",
    reference: {
      caption: "What each field can and cannot tell you",
      columns: ["Field", "Reliability", "What it means"],
      rows: [
        ["Country", "Usually reliable", "Allocation country"],
        ["City", "Approximate", "ISP gateway, not a street address"],
        ["ISP / org", "Usually reliable", "Network operator"],
        ["ASN", "Reliable", "Announced network"],
        ["Coordinates", "Approximate", "Centre of the inferred area"],
        ["VPN / mobile", "Relay location", "Not the device's location"],
      ],
    },
    mistakes: [
      "Treating a city as a street address. IP geolocation usually locates the ISP's gateway or regional pool, which can be hundreds of kilometres from the device.",
      "Using IP location for identity or eligibility decisions. VPNs, carrier-grade NAT and privacy relays all break the link between an address and a person.",
    ],
    sources: [{ label: "RFC 791 — Internet Protocol", href: "https://www.rfc-editor.org/rfc/rfc791" }],
    extraFaqs: [
      {
        q: "How accurate is city-level IP location?",
        a: "It is approximate. Country is usually right; city is inferred from the ISP's allocation and can be off by hundreds of kilometres, especially on mobile networks.",
      },
      {
        q: "Why does a VPN show the wrong location?",
        a: "The lookup reports the location of the exit relay, not the device. A VPN, proxy or privacy relay deliberately hides the underlying network.",
      },
    ],
  },

  "speed-test": {
    answer:
      "This test discards a 750 kB warm-up, times a 4 MB download, posts 1 MB of random data and takes five latency samples against this site's own endpoint. It measures one TCP connection, so a fast line over Wi-Fi will often report below the plan.",
    reference: {
      caption: "What one run measures",
      columns: ["Measurement", "Payload / sample", "Unit"],
      rows: [
        ["Latency", "5 small requests", "ms (median)"],
        ["Jitter", "Mean change between pings", "ms"],
        ["Download", "750 kB + 4 MB", "Mbit/s"],
        ["Upload", "1 MB POST", "Mbit/s"],
        ["MB/s", "Mbit/s ÷ 8", "decimal megabytes"],
        ["Data used", "About 5.75 MB", "per run"],
      ],
    },
    mistakes: [
      "Comparing a Wi-Fi result with a wired plan. Wi-Fi overhead, distance from the access point and a busy device all reduce the number before the line is the bottleneck.",
      "Confusing Mbit/s with MB/s. A 100 Mbit/s plan tops out at about 12.5 MB/s; seeing 11–12 MB/s in a browser is normal, not a shortfall.",
    ],
    sources: [{ label: "RFC 6349 — TCP throughput methodology", href: "https://www.rfc-editor.org/rfc/rfc6349" }],
    conversions: [
      { label: "Mbit/s to MB/s", href: "/convert/data-rate/megabits-per-second-to-megabytes-per-second" },
      { label: "MB/s to Mbit/s", href: "/convert/data-rate/megabytes-per-second-to-megabits-per-second" },
      { label: "km/h to mph", href: "/convert/speed/kilometres-per-hour-to-miles-per-hour" },
    ],
    extraFaqs: [
      {
        q: "What is jitter?",
        a: "Jitter is the average change between consecutive latency samples, not the gap between the fastest and slowest. High jitter makes calls and games feel unstable even when the median latency looks acceptable.",
      },
      {
        q: "Can I test a different server?",
        a: "No. The test measures this site's endpoint only, so the distance to this server is part of the result. Use a local tool if you need to isolate your own network.",
      },
    ],
  },

  "system-info": {
    answer:
      "A live report of what the browser exposes: browser and engine, platform, architecture, screen in CSS and device pixels, pixel ratio, GPU, memory hints and storage. Values are reported as unavailable when the browser hides them, not guessed.",
    reference: {
      caption: "Where each value comes from",
      columns: ["Value", "Source", "Precision"],
      rows: [
        ["Browser and engine", "Client Hints, navigator.userAgent", "Major version only"],
        ["Platform and architecture", "Client Hints high-entropy values", "Desktop only in some browsers"],
        ["Logical cores", "navigator.hardwareConcurrency", "Coarse"],
        ["Device memory", "navigator.deviceMemory", "Coarse, capped at 8 GB"],
        ["Screen", "screen.width / height", "CSS pixels, not the panel's native size"],
        ["Native resolution", "screen size × devicePixelRatio", "Estimated; affected by zoom"],
        ["GPU", "WEBGL_debug_renderer_info", "Often masked"],
        ["Storage", "navigator.storage.estimate", "Origin quota, not disk size"],
      ],
    },
    mistakes: [
      "Treating the user agent as a security signal. It is client-controlled and deliberately reduced; use feature detection and server-side validation instead.",
      "Reading a missing device-memory value as a low-memory warning. Browsers cap or omit the value for privacy, so absence means unavailable, not zero.",
    ],
    sources: [
      { label: "MDN — Navigator interface", href: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator" },
      { label: "MDN — User-Agent Client Hints API", href: "https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API" },
    ],
    extraFaqs: [
      {
        q: "Why is device memory missing?",
        a: "Browsers expose only a coarse, capped estimate, and some omit it entirely for privacy. The page reports unavailable rather than inventing a number.",
      },
      {
        q: "Can this identify my exact device?",
        a: "A combination of screen, GPU and platform details can be distinctive. That is why the page avoids extra fingerprinting signals such as font lists or canvas hashes.",
      },
    ],
  },

  "lorem-ipsum-generator": {
    answer:
      "Lorem ipsum starts with “Lorem ipsum dolor sit amet, consectetur adipiscing elit.” This generator produces paragraphs or a fixed number of sentences per paragraph, with an optional classic opening.",
    reference: {
      caption: "What the controls do",
      columns: ["Setting", "What it does", "Exact?"],
      rows: [
        ["Paragraphs", "1–12 blocks", "Exact count"],
        ["Sentences per paragraph", "1–10 sentences", "Exact count"],
        ["Classic opening", "Starts with Lorem ipsum…", "First paragraph only"],
        ["Sentence length", "8–19 words", "Random"],
        ["Word count", "Shown after generation", "Measured, not requested"],
      ],
    },
    mistakes: [
      "Shipping placeholder copy. Lorem ipsum is layout filler; replacing it is a required step before publication, not a polish task.",
      "Calling it real Latin. It is a corrupted excerpt from Cicero, not grammatical classical Latin, and it is not meant to be read.",
    ],
    sources: [{ label: "The Latin Library — Cicero, De Finibus", href: "https://www.thelatinlibrary.com/cicero/fin.shtml" }],
    extraFaqs: [
      {
        q: "Is Lorem ipsum real Latin?",
        a: "It is derived from Cicero's De finibus bonorum et malorum, but the standard passage is altered and not grammatical classical Latin. It exists to look like prose without being read.",
      },
      {
        q: "Can I generate an exact word count?",
        a: "Not directly. Choose the number of paragraphs and sentences per paragraph; the measured word count is shown after generation so you can adjust it.",
      },
    ],
  },

  "test-data-generator": {
    answer:
      "A fixed seed makes the same rows every run. Choose fields, generate up to 200 records, and export JSON, CSV or SQL; emails use reserved example domains and phone numbers use the 555-01xx range.",
    reference: {
      caption: "What the generated fields are based on",
      columns: ["Field", "Generated from", "Reserved / safe?"],
      rows: [
        ["Email", "example.com, example.org, test.example", "Reserved domains"],
        ["Phone", "+1 555 01xx xxxx", "555-0100–0199 range"],
        ["Address", "Street pool + number", "Fictional, not deliverable"],
        ["Date", "2023-01-01 + 0–899 days", "ISO date"],
        ["UUID", "Random hex with v4/variant bits", "Format valid, not cryptographic"],
        ["SQL", "INSERT with quoted strings", "Escaped, not parameterised"],
      ],
    },
    mistakes: [
      "Loading generated rows into a production database. The names and addresses are fictional; treat the output as a fixture, not real customer data.",
      "Assuming every 555 number is fictional. Only 555-0100 through 555-0199 are reserved for examples in North America; this generator stays inside that block.",
    ],
    sources: [
      { label: "RFC 2606 — Reserved example domains", href: "https://www.rfc-editor.org/rfc/rfc2606" },
      { label: "RFC 5737 — Documentation IPv4 addresses", href: "https://www.rfc-editor.org/rfc/rfc5737" },
    ],
    extraFaqs: [
      {
        q: "Can I generate more than 200 rows?",
        a: "No. The row count is capped at 200 per run. Generate several batches with different seeds if a fixture needs more records than that.",
      },
      {
        q: "Can I import the SQL directly?",
        a: "The output is a set of escaped INSERT statements for a test_data table. Run it against a scratch database and adjust the table name or types to your schema.",
      },
    ],
  },

  "markdown-editor": {
    answer:
      "Markdown is plain text with punctuation conventions: # for headings, ** for strong text and [label](url) for links. This editor renders GFM in the browser, strips scripts from raw HTML and exports .md or HTML.",
    reference: {
      caption: "Syntax this editor handles",
      columns: ["Syntax", "Result", "Extension"],
      rows: [
        ["# Heading", "h1", "CommonMark"],
        ["**strong**", "strong", "CommonMark"],
        ["[label](url)", "link", "CommonMark"],
        ["| a | b |", "table", "GFM"],
        ["- [x] task", "checkbox", "GFM"],
        ["<script>", "stripped", "Sanitised, not rendered"],
      ],
    },
    mistakes: [
      "Assuming GFM is CommonMark. Tables, task lists and strikethrough are GitHub extensions; a strict CommonMark renderer may not support them.",
      "Pasting untrusted HTML and assuming the preview is a security boundary. The editor strips scripts and event handlers, but do not paste secrets into any web page.",
    ],
    sources: [
      { label: "CommonMark specification", href: "https://spec.commonmark.org/" },
      { label: "GitHub Flavored Markdown specification", href: "https://github.github.com/gfm/" },
    ],
    extraFaqs: [
      {
        q: "Does it support MDX?",
        a: "No. MDX components, imports and JSX are not rendered. The editor handles CommonMark plus the usual GitHub-flavoured tables and task lists.",
      },
      {
        q: "Is the preview safe for untrusted Markdown?",
        a: "Scripts, event handlers and javascript: links are stripped before rendering. That reduces the risk but is not a substitute for treating untrusted content carefully.",
      },
    ],
  },

  "text-analyzer": {
    answer:
      "Flesch reading ease combines average sentence length and syllables per word; 60–70 is plain English. This page counts words, sentences and paragraphs, shows reading time at 220 words per minute and estimates syllables with a rule-based counter.",
    reference: {
      caption: "Flesch reading-ease bands",
      columns: ["Score", "Reading level", "Typical use"],
      rows: [
        ["80–100", "Very easy", "5th grade"],
        ["70–79", "Easy", "6th–7th grade"],
        ["60–69", "Plain English", "8th–9th grade"],
        ["50–59", "Fairly difficult", "High school"],
        ["30–49", "Difficult", "College"],
        ["0–29", "Very difficult", "Graduate"],
      ],
    },
    mistakes: [
      "Treating a Flesch score as a grade-level verdict. The formula is a guide, and technical terms or names can shift it by several points.",
      "Running an English readability formula on another language. The syllable heuristic is English-oriented; the score is not meaningful for most non-English text.",
    ],
    sources: [
      { label: "Flesch (1948) — A new readability yardstick", href: "https://doi.org/10.1037/h0057532" },
      { label: "Unicode UAX #29 — Text segmentation", href: "https://www.unicode.org/reports/tr29/" },
    ],
    extraFaqs: [
      {
        q: "What counts as a word?",
        a: "A run of Unicode letters, numbers, apostrophes or hyphens. Standalone punctuation and symbols are not words, so a code snippet can produce a lower count than it looks.",
      },
      {
        q: "Why does the syllable count look wrong?",
        a: "Syllables are estimated with a vowel-group heuristic. Names, technical terms and non-English words often break the rule, so the reading scores are approximate.",
      },
    ],
  },

  "timezone-buddy": {
    answer:
      "A time-zone planner compares the same instant across IANA zones, so daylight-saving changes are applied automatically. Shift the reference hour and the table shows each city's local time, date and whether it falls inside 09:00–18:00 on a weekday.",
    reference: {
      caption: "Typical planning gaps",
      columns: ["Cities", "Typical offset", "Planning note"],
      rows: [
        ["London / New York", "5 hours (winter)", "Overlap late afternoon in London"],
        ["London / Tokyo", "9 hours", "No same-day office overlap"],
        ["Berlin / Lisbon", "1 hour", "Easy overlap"],
        ["New York / Tokyo", "14 hours (winter)", "One side is always out of hours"],
        ["Sydney / Los Angeles", "19 hours (southern summer)", "Date line changes the day"],
        ["UTC / any city", "City offset", "IANA zone, not a fixed number"],
      ],
    },
    mistakes: [
      "Using a fixed UTC offset all year. DST shifts the offset by an hour in many zones, so a meeting that worked in January can be wrong in July.",
      "Forgetting the date line. Tokyo can be on the next calendar day while New York is on the previous one, which changes the weekday and the working-hours check.",
    ],
    sources: [{ label: "IANA — Time Zone Database", href: "https://www.iana.org/time-zones" }],
    extraFaqs: [
      {
        q: "What does the working-hours marker mean?",
        a: "A city is marked as working when its local time is 09:00–18:00 on a weekday. The marker is a planning aid, not a claim about anyone's actual calendar or shift pattern.",
      },
      {
        q: "Why is the date different in Tokyo?",
        a: "The date line means Tokyo can already be on the next calendar day while New York is on the previous one. The table labels the day so the shift is visible.",
      },
    ],
  },  "url-encoder": {
    answer:
      "A space is %20 in a path and can be a plus sign in a form-encoded body. Component mode escapes reserved characters such as /, ? and &; whole-URL mode leaves them intact because they separate the parts of the address.",
    reference: {
      caption: "Reserved characters and what they do",
      columns: ["Character", "Encoded", "Role in a URL"],
      rows: [
        ["Space", "%20 or +", "Separates words inside a value"],
        ["/", "%2F", "Separates path segments"],
        ["?", "%3F", "Starts the query string"],
        ["&", "%26", "Separates query parameters"],
        ["=", "%3D", "Separates a parameter name from its value"],
        ["#", "%23", "Starts the fragment"],
        ["%", "%25", "Introduces an escape and must itself be escaped"],
      ],
    },
    mistakes: [
      "Encoding a complete URL with component mode turns https:// into https%3A%2F%2F, and the browser then treats the whole string as a path rather than an address. Use whole-URL mode for an address and component mode for a single value.",
      "Decoding twice is not the same as decoding once. A value that legitimately contains %2520 becomes %20 after one pass and a space after two, so stop as soon as the output looks like the original text.",
    ],
    sources: [
      { label: "RFC 3986 — Uniform Resource Identifier", href: "https://www.rfc-editor.org/rfc/rfc3986" },
      { label: "MDN — encodeURIComponent()", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent" },
    ],
    extraFaqs: [
      {
        q: "When should I use encodeURI instead of encodeURIComponent?",
        a: "Use encodeURI when the input is a complete address that should keep its scheme, slashes and query separators. Use encodeURIComponent for each individual parameter value, path segment or fragment, where a slash or ampersand is data rather than structure.",
      },
      {
        q: "Why did my query string lose its plus signs?",
        a: "A plus sign means a space in application/x-www-form-urlencoded data, so a decoder may turn it into one. If the plus is meant literally, encode it as %2B in the value, or use %20 for spaces and leave plus signs alone.",
      },
    ],
  },
  "cron-explainer": {
    answer:
      "A cron expression is five fields in order: minute, hour, day of month, month and day of week. An asterisk means every value, a step such as */5 means every fifth value, and ranges and commas are allowed in each field.",
    reference: {
      caption: "Cron fields in order",
      columns: ["Field", "Allowed values", "Special characters"],
      rows: [
        ["Minute", "0–59", "* , - /"],
        ["Hour", "0–23", "* , - /"],
        ["Day of month", "1–31", "* , - / ?"],
        ["Month", "1–12 or JAN–DEC", "* , - /"],
        ["Day of week", "0–7 or SUN–SAT", "* , - / ?"],
      ],
    },
    mistakes: [
      "Writing 0 9 * * 1-5 and expecting the job to skip public holidays. Cron has no holiday calendar, so the job still fires on a weekday holiday unless the command itself checks the date.",
      "Assuming the scheduler runs in your time zone. Most cron daemons use the server's local time, so the next-run times here are a planning aid until you confirm the zone the daemon uses.",
    ],
    sources: [
      { label: "crontab(5) — Linux manual page", href: "https://man7.org/linux/man-pages/man5/crontab.5.html" },
      { label: "cronie — cron daemon documentation", href: "https://github.com/cronie-crond/cronie" },
    ],
    extraFaqs: [
      {
        q: "What does */15 mean in the minute field?",
        a: "It means every 15 minutes starting from zero: minute 0, 15, 30 and 45 of every hour. A step does not mean 'every 15 minutes from now'; it always counts from the start of the field's range.",
      },
      {
        q: "Why did my job run twice at 02:30?",
        a: "A daylight-saving change can move the clock back, so the same wall-clock time occurs twice and a naive scheduler may fire twice. The reverse change can skip the time entirely and the job does not run that day.",
      },
    ],
  },
  "regex-tester": {
    answer:
      "The tester compiles your pattern with the JavaScript RegExp engine, highlights every match with its index and capture groups, and previews a replacement using $1, $& and named groups exactly as JavaScript does.",
    reference: {
      caption: "JavaScript regular-expression flags",
      columns: ["Flag", "Effect", "Typical use"],
      rows: [
        ["g", "Find every match, not just the first", "Search and replace across text"],
        ["i", "Ignore case", "Matching user-entered text"],
        ["m", "^ and $ match line boundaries", "Multi-line log files"],
        ["s", ". matches newlines too", "Parsing blocks of text"],
        ["u", "Unicode mode for code points and escapes", "Emoji and non-Latin scripts"],
        ["y", "Sticky match at lastIndex", "Tokenising a stream"],
      ],
    },
    mistakes: [
      "Writing \\d inside a JavaScript string literal without escaping the backslash, so the pattern receives a plain d. In source code the string needs \\\\d; in this tester the field is already pattern text, so a single \\d is correct.",
      "Leaving a catastrophic-backtracking pattern in the field with a long input. Nested quantifiers such as (a+)+ can take exponential time, and the tab cannot interrupt a running main-thread match.",
    ],
    sources: [
      { label: "MDN — Regular expressions guide", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions" },
      { label: "ECMAScript — RegExp objects", href: "https://tc39.es/ecma262/#sec-regexp-regular-expression-objects" },
    ],
    extraFaqs: [
      {
        q: "Why does ^ match the start of every line?",
        a: "The m flag makes ^ and $ match at line breaks in addition to the start and end of the whole string. Remove m if you want them anchored to the entire input, or keep it deliberately for line-oriented patterns.",
      },
      {
        q: "Why does my replacement show $1 literally?",
        a: "In replacement text, $1 refers to the first capture group, and a literal dollar sign must be written $$. If the pattern has no first group, or the group did not participate in the match, JavaScript leaves the reference as-is.",
      },
    ],
  },
  "subnet-calculator": {
    answer:
      "A /24 block holds 256 IPv4 addresses, but only 254 are usable because the first is the network address and the last is the broadcast address. IPv6 has no broadcast address, so every address in the prefix is usable.",
    reference: {
      caption: "Common IPv4 prefixes",
      columns: ["Prefix", "Subnet mask", "Addresses", "Usable hosts"],
      rows: [
        ["/8", "255.0.0.0", "16,777,216", "16,777,214"],
        ["/16", "255.255.0.0", "65,536", "65,534"],
        ["/24", "255.255.255.0", "256", "254"],
        ["/30", "255.255.255.252", "4", "2"],
        ["/31", "255.255.255.254", "2", "2 (point-to-point)"],
        ["/32", "255.255.255.255", "1", "1 (single host)"],
      ],
    },
    mistakes: [
      "Subtracting two addresses from an IPv6 block. IPv6 has no broadcast address and does not reserve the all-zeros address the way IPv4 reserves a network address, so the host count is the full 2 to the power of the host bits.",
      "Assuming 192.168.1.10 is always a /24. The prefix is part of the address; the same four octets inside a /26 produce a different network, broadcast address and host range.",
    ],
    sources: [
      { label: "RFC 4632 — CIDR address strategy", href: "https://www.rfc-editor.org/rfc/rfc4632" },
      { label: "RFC 4291 — IPv6 addressing architecture", href: "https://www.rfc-editor.org/rfc/rfc4291" },
    ],
    extraFaqs: [
      {
        q: "Is 169.254.0.0/16 special?",
        a: "Yes. It is the link-local block that a device assigns itself when DHCP fails, so addresses in it are not routable across the internet. Seeing one usually means the interface never received a lease, not that the subnet maths is wrong.",
      },
      {
        q: "Why does a /31 have two usable hosts?",
        a: "RFC 3021 allows a /31 on point-to-point links, where there is no need for a network or broadcast address. Both addresses are hosts, which saves two addresses per link compared with a /30.",
      },
    ],
  },
  "loan-calculator": {
    answer:
      "A fixed-rate loan payment is P × r ÷ (1 − (1 + r)^−n), where r is the annual rate divided by 12 and n is the number of monthly payments. With a 0% rate the payment is simply the principal divided by the months.",
    reference: {
      caption: "Monthly payment per £1,000 borrowed",
      columns: ["Annual rate", "2 years", "5 years", "10 years"],
      rows: [
        ["0%", "£41.67", "£16.67", "£8.33"],
        ["3%", "£40.49", "£15.47", "£7.16"],
        ["5%", "£39.70", "£14.70", "£6.44"],
        ["7%", "£38.93", "£13.97", "£5.78"],
        ["10%", "£37.81", "£12.91", "£4.88"],
      ],
    },
    mistakes: [
      "Comparing the nominal rate with an APR. The APR folds in fees and the timing of payments, so two loans with the same quoted rate can cost different amounts; compare APRs before choosing.",
      "Assuming the payment stays fixed for the whole term on a variable-rate loan. This calculator models a fixed rate; when the rate changes, the payment or the term changes with it and the schedule must be recalculated.",
    ],
    sources: [
      { label: "CFPB — Mortgage and loan tools", href: "https://www.consumerfinance.gov/consumer-tools/mortgages/" },
      { label: "FCA — Borrowing money guide", href: "https://www.fca.org.uk/consumers/borrowing-money" },
    ],
    extraFaqs: [
      {
        q: "Why does a longer term lower the payment but cost more?",
        a: "Spreading the same principal over more months lowers each payment, but interest is charged every month on the remaining balance. More months means more interest charges, so the total repaid rises even though the monthly figure falls.",
      },
      {
        q: "How is the final payment adjusted?",
        a: "Each month's interest is rounded to the cent and subtracted from the payment, so repeated rounding can leave a balance of a few cents at the end. The last row absorbs that difference so the schedule finishes at exactly zero.",
      },
    ],
  },
  "vat-calculator": {
    answer:
      "To remove VAT from a gross amount, divide by 1 + the rate as a decimal: £120 at 20% is 120 ÷ 1.20 = £100 net. Subtracting 20% of £120 gives £96, which is wrong because the tax was charged on the net, not the gross.",
    reference: {
      caption: "Standard VAT and GST rates",
      columns: ["Country", "Standard rate", "Reduced rate"],
      rows: [
        ["United Kingdom", "20%", "5%"],
        ["Ireland", "23%", "13.5%"],
        ["Germany", "19%", "7%"],
        ["France", "20%", "5.5%"],
        ["Spain", "21%", "10%"],
        ["Australia (GST)", "10%", "None"],
      ],
    },
    mistakes: [
      "Subtracting the VAT rate from a VAT-inclusive total. Twenty percent of the gross is not the VAT inside it; the correct reverse is division by 1.20, and the difference grows with the rate and the amount.",
      "Assuming one country's rate applies to a cross-border sale. Place of supply, registration thresholds and reverse-charge rules decide which rate applies, and the calculator cannot infer them from an amount.",
    ],
    sources: [
      { label: "European Commission — VAT rates", href: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en" },
      { label: "GOV.UK — VAT rates", href: "https://www.gov.uk/vat-rates" },
    ],
    extraFaqs: [
      {
        q: "How do I remove VAT from a gross amount?",
        a: "Divide the gross by 1 + rate ÷ 100. At 20% divide by 1.2, at 5% divide by 1.05. The result is the net, and the VAT is the gross minus the net, which is not the same as the rate applied to the gross.",
      },
      {
        q: "Do all items use the standard rate?",
        a: "No. Many countries apply reduced, zero or exempt rates to food, books, children's clothing or financial services. The rate field is manual because the correct rate depends on the item and the jurisdiction, not on the amount.",
      },
    ],
  },
  "iban-validator": {
    answer:
      "An IBAN is valid when its country length matches and the mod-97 checksum of the rearranged characters equals 1. The checksum proves the characters are consistent; it does not prove the account is open or belongs to the person you are paying.",
    reference: {
      caption: "IBAN length by country",
      columns: ["Country", "Code", "Length", "Example prefix"],
      rows: [
        ["Germany", "DE", "22", "DE89 3704"],
        ["United Kingdom", "GB", "22", "GB82 WEST"],
        ["France", "FR", "27", "FR14 2004"],
        ["Netherlands", "NL", "18", "NL91 ABNA"],
        ["Spain", "ES", "24", "ES91 2100"],
        ["Italy", "IT", "27", "IT60 X054"],
      ],
    },
    mistakes: [
      "Checking only the checksum and ignoring the country length. A transposed pair of characters can still produce a plausible number, and the length table catches many mistakes before the arithmetic even runs.",
      "Treating a passing check as proof of ownership. A valid IBAN for a closed account, or for an account at a different bank, still passes; only the receiving bank can confirm the account is live and belongs to the payee.",
    ],
    sources: [
      { label: "SWIFT — IBAN registry", href: "https://www.swift.com/standards/data-standards/iban-international-bank-account-number" },
      { label: "ISO 13616 — IBAN standard", href: "https://www.iso.org/standard/81090.html" },
    ],
    extraFaqs: [
      {
        q: "Why do some countries use different IBAN lengths?",
        a: "The IBAN is a national account number wrapped in a country prefix, so its length follows each country's own account format. Germany uses 22 characters while France uses 27, and the registry records the exact length per country.",
      },
      {
        q: "What does the BIC branch code mean?",
        a: "An 11-character BIC adds a three-character branch identifier after the eight-character bank code. The shorter eight-character form refers to the bank's head office, and many payments accept either when the branch is not required.",
      },
    ],
  },
  "color-contrast-checker": {
    answer:
      "WCAG AA needs a contrast ratio of 4.5:1 for normal text and 3:1 for large text; AAA raises those to 7:1 and 4.5:1. The ratio is (lighter luminance + 0.05) ÷ (darker luminance + 0.05), so black on white is 21:1.",
    reference: {
      caption: "WCAG 2.2 contrast thresholds",
      columns: ["Content", "AA", "AAA"],
      rows: [
        ["Normal text", "4.5:1", "7:1"],
        ["Large text", "3:1", "4.5:1"],
        ["UI components", "3:1", "Not defined"],
        ["Graphical objects", "3:1", "Not defined"],
        ["Focus indicators", "3:1", "Not defined"],
      ],
    },
    mistakes: [
      "Judging contrast from a compressed screenshot. Screenshot compression shifts colour values, so the sampled colour can differ from the CSS value; always test the hex values the page actually renders.",
      "Testing only the default state. Hover, focus, disabled and dark-mode variants each have their own foreground and background pair, and a palette that passes on the base page can fail on one of them.",
    ],
    sources: [
      { label: "W3C — Web Content Accessibility Guidelines 2.2", href: "https://www.w3.org/TR/WCAG22/" },
      { label: "WebAIM — Contrast and color accessibility", href: "https://webaim.org/articles/contrast/" },
    ],
    extraFaqs: [
      {
        q: "What counts as large text?",
        a: "WCAG treats 18pt (24px) regular text, or 14pt (about 18.66px) bold text, as large. Large text has a lower threshold because thicker strokes remain legible at lower contrast, but body copy almost never qualifies.",
      },
      {
        q: "Does the ratio change with font weight?",
        a: "No. The contrast ratio depends only on the two colours. Font weight matters because WCAG allows the large-text threshold for bold text at 14pt, but the calculated ratio for a given pair is unchanged.",
      },
    ],
  },
  "tip-calculator": {
    answer:
      "On a £60 bill, a 20% tip is £12 and the total is £72; split four ways that is £18 each. Round-up raises the total to the next whole unit before splitting, and the extra is added to the tip.",
    reference: {
      caption: "Tip by percentage on a £60 bill",
      columns: ["Tip", "Tip amount", "Total"],
      rows: [
        ["10%", "£6.00", "£66.00"],
        ["15%", "£9.00", "£69.00"],
        ["18%", "£10.80", "£70.80"],
        ["20%", "£12.00", "£72.00"],
        ["25%", "£15.00", "£75.00"],
      ],
    },
    mistakes: [
      "Rounding each person's share down and leaving the group short. Split the rounded total rather than rounding every share independently, or decide up front who covers the remaining pence.",
      "Tipping on the post-tax total when you meant to tip on the food and drink. The percentage applies to whatever is in the bill field, so enter the subtotal if that is the base you intend.",
    ],
    sources: [
      { label: "GOV.UK — Tipping and service charges", href: "https://www.gov.uk/tipping" },
      { label: "VisitBritain — Tipping in the UK", href: "https://www.visitbritain.com/en/plan-your-trip/tipping-uk" },
    ],
    extraFaqs: [
      {
        q: "Should the tip be split before or after rounding?",
        a: "Round the total first, then split, so the group agrees on one amount. Rounding each share separately can leave the collected total a few pence below the bill, while rounding up always covers it.",
      },
      {
        q: "How do I split a bill unevenly?",
        a: "Calculate the tip on the whole bill, then divide the total by each person's share of the order rather than by headcount. This calculator only does equal splits, so use the per-person figure as a starting point.",
      },
    ],
  },
  "iso-duration-parser": {
    answer:
      "P3Y6M4DT12H30M5S means 3 years, 6 months, 4 days, 12 hours, 30 minutes and 5 seconds. The M before T is months and the M after T is minutes, which is why ISO 8601 durations are read left to right.",
    reference: {
      caption: "ISO 8601 duration designators",
      columns: ["Designator", "Unit", "Fixed seconds"],
      rows: [
        ["Y", "Years", "31,536,000"],
        ["M (before T)", "Months", "2,592,000"],
        ["W", "Weeks", "604,800"],
        ["D", "Days", "86,400"],
        ["H", "Hours", "3,600"],
        ["M (after T)", "Minutes", "60"],
        ["S", "Seconds", "1"],
      ],
    },
    mistakes: [
      "Reading P1M as one minute. Before the T designator M means months; minutes only appear after T, so one minute is PT1M and one month is P1M.",
      "Converting a month-based duration to seconds and adding that to a date. Months and years have no fixed length, so the sum can land on the wrong day; add calendar units to the date first, then add the fixed units.",
    ],
    sources: [
      { label: "ISO 8601-1 — Date and time representations", href: "https://www.iso.org/standard/70907.html" },
      { label: "MDN — Temporal.Duration", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration" },
    ],
    extraFaqs: [
      {
        q: "Is PT0S a valid duration?",
        a: "Yes. PT0S is the zero duration and is valid ISO 8601. A bare P with no components is not valid, so zero must still name at least one unit, usually seconds.",
      },
      {
        q: "How do I add a duration to a date?",
        a: "Add years, months and days to the calendar date first, then add hours, minutes and seconds, so month lengths and daylight-saving changes are applied by the calendar rather than by a fixed number of seconds.",
      },
    ],
  },
};

export function toolDetail(slug: string): ToolDetail {
  const detail = toolDetails[slug];
  if (!detail) throw new Error(`Missing tool detail for: ${slug}`);
  return detail;
}
