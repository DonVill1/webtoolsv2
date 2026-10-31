import type { ToolDefinition } from "../types";

const date = "2026-10-28";

export const developerTools: ToolDefinition[] = [
  {
    slug: "json-validator",
    name: "JSON validator & formatter",
    category: "developers",
    intent: "validate and format JSON and find syntax errors",
    seo: {
      title: "JSON Validator & Formatter — Find the Error",
      description:
        "Validate JSON, find the line and column of the first syntax error, then format or minify it. Runs entirely in your browser.",
    },
    content: {
      intro:
        "Paste JSON to check it, see the exact line and column of the first error, and format or minify the result. Large documents are handled without uploading them.",
      howItWorks: [
        "The parser is the browser's native JSON.parse, so it accepts exactly what a JavaScript runtime accepts — no stricter, no looser. When parsing fails, the error position is mapped back to a line and column and shown next to the editor.",
        "Formatting applies a two-space indent by default and preserves key order, because JSON objects are ordered in practice even though the specification does not require it. Minifying removes whitespace only; it does not change values.",
      ],
      examples: [
        {
          input: '{"a":1,}',
          output: "Error at line 1, column 8",
          note: "trailing comma",
        },
        { input: '{"a":1,"b":[2,3]}', output: '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}' },
      ],
      limits:
        "Duplicate keys are accepted and the last value wins, matching JavaScript behaviour. JSON5, comments and trailing commas are invalid JSON and are reported as errors rather than silently repaired.",
      faqs: [
        {
          q: "Why is a trailing comma reported as an error?",
          a: "Standard JSON does not allow a comma after the last member. Some tools silently strip it; this one reports the position so the same input will not fail in your runtime.",
        },
        {
          q: "Does it validate against a schema?",
          a: "No. This checks JSON syntax, not JSON Schema conformance. Schema validation needs the schema document and a separate validator.",
        },
        {
          q: "Is the JSON uploaded?",
          a: "No. Parsing and formatting happen in the browser. Very large inputs are limited by the tab's memory, not by a server limit.",
        },
      ],
    },
    related: ["text-converter", "jwt-decoder", "diff-checker"],
    og: { kicker: "Developer tools", value: "validate · format · minify" },
    status: "live",
    added: "2023-05-25",
    updated: date,
  },
  {
    slug: "uuid-generator",
    name: "UUID generator",
    category: "developers",
    intent: "generate random v4 UUIDs in bulk",
    seo: {
      title: "UUID Generator — v4, Bulk, Uppercase",
      description:
        "Generate cryptographically random UUID v4 values in bulk. Choose uppercase, braces or no hyphens, then copy or download the list.",
    },
    content: {
      intro:
        "Generate one or a hundred version-4 UUIDs from the browser's cryptographic random source. Format them as lowercase, uppercase, braced or hyphen-free.",
      howItWorks: [
        "crypto.randomUUID() produces a version-4 UUID from a cryptographically secure random number generator, with the version and variant bits set according to RFC 9562. The formatting options only change presentation, never the underlying value.",
        "If randomUUID is unavailable, the generator falls back to crypto.getRandomValues and sets the same bits manually. No Math.random path is used, because those values are not suitable for identifiers.",
      ],
      examples: [
        {
          input: "1 UUID, lowercase",
          output: "3f2b9c1e-7a4d-4a2f-9c3e-1b5d6f7a8c90",
          note: "version 4, variant 10xx",
        },
      ],
      limits:
        "A v4 UUID is random, not sequential, so it is a poor database primary key for write-heavy tables. These are not v5 or v7 namespaced/time-ordered identifiers.",
      faqs: [
        {
          q: "Are these UUIDs secure?",
          a: "They come from the platform's cryptographically secure generator. A v4 UUID has 122 random bits, which is enough that collisions are not a practical concern.",
        },
        {
          q: "Should I use a UUID as a database key?",
          a: "It works, but random v4 keys fragment B-tree indexes. UUID v7 is time-ordered and better for that use; this generator produces v4 only.",
        },
        {
          q: "Can I generate more than one at a time?",
          a: "Yes, up to 100 per run. Generating in bulk does not reuse or weaken the randomness of individual values.",
        },
      ],
    },
    related: ["password-generator", "hash-generator", "timestamp-converter"],
    og: { kicker: "Developer tools", value: "UUID v4" },
    status: "live",
    added: "2023-09-01",
    updated: date,
  },
  {
    slug: "jwt-decoder",
    name: "JWT decoder",
    category: "developers",
    intent: "decode a JSON web token header and payload",
    seo: {
      title: "JWT Decoder — Header, Payload, Expiry",
      description:
        "Decode a JSON Web Token to inspect its header, payload and expiry. See whether the token has expired. Signature verification is not performed.",
    },
    content: {
      intro:
        "Paste a JWT to read the header and payload, see the issued-at and expiry times as real dates, and check whether the token is still valid right now.",
      howItWorks: [
        "A JWT is three Base64URL segments separated by dots. The decoder converts the first two back to JSON and pretty-prints them. Numeric date claims such as exp, iat and nbf are shown as ISO dates and UTC strings.",
        "The third segment is a signature. This tool deliberately does not verify it, because verification requires the issuer's key and the correct algorithm policy.",
      ],
      examples: [
        {
          input: "header.payload.signature",
          output: '{"alg":"HS256","typ":"JWT"} · {"sub":"1234","exp":…}',
          note: "exp is shown as an ISO date",
        },
      ],
      limits:
        "Decoding is not verification. Never treat a decoded payload as trusted, and never paste a production token into a third-party site — this one keeps it in the tab, but the safest option is still a local tool.",
      faqs: [
        {
          q: "Does this verify the signature?",
          a: "No. It decodes the header and payload only. A token is only trustworthy after signature verification with the issuer's key.",
        },
        {
          q: "Why is my token rejected as malformed?",
          a: "It must have three dot-separated Base64URL segments whose first two decode as JSON. A missing segment or standard Base64 padding can cause the error.",
        },
        {
          q: "Is the token sent to a server?",
          a: "No. Decoding happens in the browser. Even so, avoid pasting long-lived production credentials into any web page.",
        },
      ],
    },
    related: ["base64-encoder", "json-validator", "hash-generator"],
    og: { kicker: "Developer tools", value: "header · payload · exp" },
    status: "live",
    added: "2026-10-27",
    updated: date,
  },
  {
    slug: "hash-generator",
    name: "Hash generator",
    category: "developers",
    intent: "generate sha-1 sha-256 sha-384 sha-512 hashes",
    seo: {
      title: "Hash Generator — SHA-1, SHA-256, SHA-512",
      description:
        "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text in your browser. Compare against an expected digest in one step.",
    },
    content: {
      intro:
        "Hash text with SHA-1, SHA-256, SHA-384 or SHA-512 using the browser's Web Crypto implementation, and compare the result with an expected digest.",
      howItWorks: [
        "Web Crypto's subtle.digest produces the hash from UTF-8 bytes. The result is rendered as lowercase hexadecimal, the convention used by checksums and most developer tooling.",
        "Hashes are one-way: the same input always produces the same digest, and a changed input produces an unrelated one. That is why they are used for integrity checks rather than encryption.",
      ],
      examples: [
        {
          input: "hello · SHA-256",
          output: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        },
      ],
      limits:
        "SHA-1 and MD5-style digests are unsuitable for security. This tool does not add a salt or a work factor, so it is not a password hashing tool; use Argon2, scrypt or bcrypt for that.",
      faqs: [
        {
          q: "Which hash should I use?",
          a: "SHA-256 is the default for integrity checks. Use SHA-512 where a longer digest is required, and avoid SHA-1 for anything security-related.",
        },
        {
          q: "Can I hash a file?",
          a: "Not on this page yet. The current version hashes text. File hashing is planned with the same Web Crypto path.",
        },
        {
          q: "Is a hash encryption?",
          a: "No. Encryption is reversible with a key; a hash is not reversible. Hashing is for integrity and fingerprints.",
        },
      ],
    },
    related: ["base64-encoder", "password-generator", "jwt-decoder"],
    og: { kicker: "Developer tools", value: "SHA-256" },
    status: "live",
    added: "2026-10-27",
    updated: date,
  },
  {
    slug: "timestamp-converter",
    name: "Unix timestamp converter",
    category: "developers",
    intent: "convert unix timestamps to dates and back",
    seo: {
      title: "Unix Timestamp Converter — Seconds & ISO",
      description:
        "Convert Unix timestamps in seconds or milliseconds to ISO 8601, UTC and local time. See the 2038 limit and the current epoch at a glance.",
    },
    content: {
      intro:
        "Turn a Unix timestamp into an ISO date, UTC string and your local time. Choose whether the input is seconds or milliseconds before converting.",
      howItWorks: [
        "Unix time counts seconds since 1970-01-01T00:00:00Z, ignoring leap seconds. JavaScript dates use milliseconds, so the converter multiplies by 1000 when the input is seconds. The unit is an explicit choice, not a guess based on digit count.",
        "The current timestamp is shown live from the device clock. The local and UTC renderings are displayed side by side because they differ by the browser's offset.",
      ],
      examples: [
        { input: "1767225600", output: "2026-01-01T00:00:00.000Z", note: "seconds" },
        { input: "1767225600000", output: "2026-01-01T00:00:00.000Z", note: "milliseconds selected" },
      ],
      limits:
        "Values before 1970 are negative and are supported. The timestamp is only as correct as the device clock, and local output depends on the browser's time-zone database.",
      faqs: [
        {
          q: "Seconds or milliseconds?",
          a: "Both, but you choose the unit. Select seconds or milliseconds before converting; the page does not guess from the number of digits.",
        },
        {
          q: "Why does my local time differ from UTC?",
          a: "Unix time is absolute; local time applies the device's offset and daylight-saving rules. The page shows both so the difference is explicit.",
        },
        {
          q: "Does it support dates before 1970?",
          a: "Yes, negative timestamps convert normally. Some systems cannot represent them, which is a limitation of those systems rather than of Unix time.",
        },
      ],
    },
    related: ["timezone-buddy", "birthday-countdown", "uuid-generator"],
    og: { kicker: "Developer tools", value: "1767225600 → 2026-01-01" },
    status: "live",
    added: "2026-10-27",
    updated: date,
  },
  {
    slug: "diff-checker",
    name: "Diff checker",
    category: "developers",
    intent: "compare two blocks of text and find differences",
    seo: {
      title: "Diff Checker — Compare Two Texts",
      description:
        "Compare two texts line by line and see additions, removals and unchanged lines. No upload, no account, works on long documents.",
    },
    content: {
      intro:
        "Paste an original and a changed version to see exactly which lines were added, removed or left alone, with a count for each.",
      howItWorks: [
        "The comparison uses a longest-common-subsequence pass over lines, which is the same family of algorithm used by version control diff tools. It reports stable context around changes rather than marking everything after the first edit as different.",
        "Whitespace is significant by default. The collapse option reduces runs of spaces to one and trims both ends, not just trailing spaces.",
      ],
      examples: [
        { input: "alpha\\nbeta → alpha\\ngamma", output: "− beta\\n+ gamma", note: "one line replaced" },
      ],
      limits:
        "The diff is line-based, not character-based, so a single changed word marks the whole line. Very large inputs are capped to keep the page responsive.",
      faqs: [
        {
          q: "Does it ignore whitespace?",
          a: "The toggle collapses runs of spaces and trims both ends. Newlines and every other character still matter; it is not a general whitespace-insensitive mode.",
        },
        {
          q: "Is the text uploaded?",
          a: "No. The comparison runs in the browser and nothing is stored after the tab closes.",
        },
        {
          q: "Can it compare files?",
          a: "Drop or paste the contents of two text files. Binary files are not supported; the results would be meaningless.",
        },
      ],
    },
    related: ["json-validator", "text-converter", "text-analyzer"],
    og: { kicker: "Developer tools", value: "line diff" },
    status: "live",
    added: "2026-10-27",
    updated: date,
  },
  {
    slug: "password-generator",
    name: "Password generator",
    category: "developers",
    intent: "generate strong random passwords",
    seo: {
      title: "Password Generator — Strong, Local, Free",
      description:
        "Generate strong passwords with a cryptographic random source. Choose length and character sets, and see the entropy in bits.",
    },
    content: {
      intro:
        "Build a password from a cryptographic random source, with control over length and character sets, and an honest estimate of its entropy.",
      howItWorks: [
        "Characters are drawn with crypto.getRandomValues from the selected alphabet, using rejection sampling so every character is equally likely. Entropy is length × log2(alphabet size), which is the correct measure for a uniformly random password.",
        "The strength label uses the entropy figure, not a guess based on symbols. A 16-character password from the full 86-character set is about 103 bits; a 20-character one is about 129 bits.",
      ],
      examples: [
        { input: "20 chars, all sets", output: "entropy ≈ 129 bits", note: "not stored or sent" },
      ],
      limits:
        "Generated passwords exist only in this tab until you save them. A password manager is still the right place to store them, and entropy alone does not protect against reuse or phishing.",
      faqs: [
        {
          q: "How long should a password be?",
          a: "For a random password, 16 characters is comfortable and 20 is generous. Length matters more than adding more symbol sets.",
        },
        {
          q: "Is this more secure than a passphrase?",
          a: "Both can be strong. A random 20-character password has more entropy per character; a passphrase is easier to type and remember. Use whichever your password manager supports.",
        },
        {
          q: "Are passwords ever sent to a server?",
          a: "No. Generation happens locally with the browser's crypto API. The page does not log or transmit the result.",
        },
      ],
    },
    related: ["uuid-generator", "hash-generator", "base64-encoder"],
    og: { kicker: "Developer tools", value: "entropy · bits" },
    status: "live",
    added: "2026-10-27",
    updated: date,
  },
  {
    slug: "qr-code-generator",
    name: "QR code generator",
    category: "developers",
    intent: "generate a QR code for a URL or text",
    seo: {
      title: "QR Code Generator — SVG and PNG",
      description:
        "Generate a QR code for a URL, text, Wi-Fi string or vCard, then download it as SVG or PNG. Error correction and size are adjustable.",
    },
    content: {
      intro:
        "Turn a URL or a short piece of text into a QR code, choose the error-correction level, and download a crisp SVG for print or a PNG at the selected pixel size.",
      howItWorks: [
        "The encoder builds the QR matrix locally, including Reed–Solomon error-correction blocks. Higher correction levels survive more damage but leave less room for data, so the version and module count grow.",
        "SVG output is resolution-independent and is the right choice for print. PNG is rasterised at the selected pixel size for screens and slide decks.",
      ],
      examples: [
        { input: "https://example.com", output: "version 2, 25×25 modules", note: "level M" },
      ],
      limits:
        "QR codes hold up to about 3 KB of data depending on the version and correction level, and very long text produces a dense code that is hard to scan at small sizes. A short URL scans more reliably.",
      faqs: [
        {
          q: "Which error-correction level should I use?",
          a: "Medium (M) is the usual default. Use High (H) if the code will be printed small, placed on a curved surface or likely to be partly obscured.",
        },
        {
          q: "Why does my QR code fail to scan?",
          a: "Usually the printed size is too small for the module count, or there is not enough quiet margin. Keep at least four modules of empty space around the code.",
        },
        {
          q: "Do these codes expire?",
          a: "No. The data is encoded directly in the image, so there is no redirect and nothing to expire. The trade-off is that a changed URL needs a new code.",
        },
      ],
    },
    related: ["base64-encoder", "uuid-generator", "image-compressor"],
    og: { kicker: "Developer tools", value: "SVG · PNG" },
    status: "live",
    added: "2026-10-27",
    updated: date,
  },
];
