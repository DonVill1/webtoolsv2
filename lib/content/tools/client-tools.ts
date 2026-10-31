import type { ToolDefinition } from "../types";

const date = "2026-10-28";

/**
 * Tools that need no backend: parsing, validation, formatting and arithmetic
 * that runs entirely in the tab. Kept in one file because they shipped as a
 * batch; each is a normal live tool to the registry, sitemap and tool page.
 */
export const clientTools: ToolDefinition[] = [
  {
    slug: "url-encoder",
    name: "URL encoder & parser",
    category: "developers",
    intent: "percent-encode URLs and inspect their parts",
    seo: {
      title: "URL Encoder & Parser — Percent-Encoding",
      description:
        "Percent-encode or decode a URL or a single component, and inspect the scheme, host, path, query parameters and fragment. Nothing leaves the browser.",
    },
    content: {
      intro:
        "Encode text for a URL, decode an existing one, and break a full URL into the parts a request actually uses. It shows why a space becomes %20 in one field and a plus sign in another.",
      howItWorks: [
        "Encoding follows RFC 3986. A component is encoded with encodeURIComponent, which escapes reserved characters such as /, ?, & and = so they can sit inside a value. A whole URL is encoded with encodeURI, which leaves those separators intact. Decoding reverses the same rules and reports malformed percent sequences instead of guessing.",
        "The parser uses the browser's URL implementation, so the scheme, credentials, host, port, path, query and fragment are split the way a request would split them. Query parameters are decoded for display and listed individually, including repeated keys.",
      ],
      examples: [
        { input: "hello world", output: "hello%20world", note: "component encoding" },
        { input: "a&b=c", output: "a%26b%3Dc", note: "reserved characters escaped" },
        { input: "https://x.test/a b?q=1", output: "/a%20b?q=1", note: "path and query separated" },
      ],
      limits:
        "This encodes and parses, it does not validate that a URL is safe to request. Percent-encoded input is decoded once; double-encoded values stay double-encoded, which is usually the bug people are looking for.",
      faqs: [
        {
          q: "What is the difference between %20 and a plus sign?",
          a: "In a path or a fragment, a space must be %20. In application/x-www-form-urlencoded bodies and some query strings, a plus sign also means a space. The encoder offers both so you can match the format you are sending.",
        },
        {
          q: "Why did encoding the whole URL break it?",
          a: "encodeURIComponent escapes the separators too, so https:// becomes https%3A%2F%2F and the result is no longer a URL. Use whole-URL mode when the input is a complete address, and component mode for a value inside it.",
        },
        {
          q: "Why are non-English characters longer after encoding?",
          a: "Percent-encoding works on UTF-8 bytes. A character outside ASCII becomes several bytes, and each byte becomes a three-character escape, so one visible character can become nine characters or more.",
        },
      ],
    },
    related: ["base64-encoder", "json-validator", "text-converter"],
    og: { kicker: "Developer tools", value: "%20 not +" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "cron-explainer",
    name: "Cron expression explainer",
    category: "developers",
    intent: "explain cron schedules and show the next runs",
    seo: {
      title: "Cron Expression Explainer — Next Run Times",
      description:
        "Translate a five-field cron expression into plain English, see each field and the next five run times in your time zone. Validates ranges, lists and steps.",
    },
    content: {
      intro:
        "Paste a cron line and read it back in English, field by field, with the next five run times calculated in your local time zone. Invalid ranges and impossible dates are reported instead of silently ignored.",
      howItWorks: [
        "A five-field cron expression is minute, hour, day of month, month and day of week. Each field accepts a wildcard, a list, a range and a step. The explainer parses those forms, validates the bounds, and searches forward minute by minute for matching times, stopping after five results.",
        "When both day of month and day of week are restricted, classic cron runs the job if either field matches, not both. The explanation calls this out because it is the most common source of an unexpected schedule.",
      ],
      examples: [
        { input: "*/5 * * * *", output: "every 5 minutes", note: "step on the minute field" },
        { input: "0 9 * * 1-5", output: "09:00, Monday to Friday", note: "weekday range" },
        { input: "30 2 1 * *", output: "02:30 on the first of the month", note: "day-of-month match" },
      ],
      limits:
        "Six-field expressions with seconds and the special macros @daily, @weekly and @reboot are not supported. Times are computed in the browser's time zone; a server in another zone can run the same expression at a different local time, and daylight-saving changes can skip or repeat an hour.",
      faqs: [
        {
          q: "Does 0 9 * * 1-5 mean every weekday?",
          a: "Yes, at 09:00 in the time zone the scheduler uses. Monday is 1 and Sunday is 0 or 7. The explainer lists the next five runs so you can confirm the weekday behaviour before deploying.",
        },
        {
          q: "Why does my job run on more days than expected?",
          a: "If both the day-of-month and day-of-week fields are restricted, classic cron treats them as an OR. To run only on the first Monday, use a single field or check the date in the job itself; the explanation names the case when it applies.",
        },
        {
          q: "Are the next runs calculated on the server?",
          a: "No. The expression is parsed and the next times are calculated in your browser, so nothing is sent anywhere. The clock and time zone are the ones on the device viewing the page.",
        },
      ],
    },
    related: ["timestamp-converter", "timezone-buddy", "regex-tester"],
    og: { kicker: "Developer tools", value: "*/5 * * * *" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "regex-tester",
    name: "Regex tester",
    category: "developers",
    intent: "test JavaScript regular expressions against text",
    seo: {
      title: "Regex Tester — JavaScript Matches & Groups",
      description:
        "Test a JavaScript regular expression against your text, see every match and capture group, and preview a replacement. Flags, indexes and errors shown live.",
    },
    content: {
      intro:
        "Write a JavaScript pattern and see every match highlighted, with its index and capture groups, plus a live replacement preview. Syntax errors and zero-length matches are reported as they happen.",
      howItWorks: [
        "The pattern is compiled with the JavaScript RegExp constructor using the flags you choose. Matches are collected with a global copy of the expression, so the same pattern can be tested repeatedly without lastIndex leaking between runs. Capture groups are shown per match, including named groups.",
        "Replacement mode applies String.replace with your replacement text, supporting $1, $<name> and $& the same way JavaScript does. The tool stops after 1,000 matches so a broad pattern cannot lock the tab.",
      ],
      examples: [
        { input: "\\b\\w+@\\w+\\.\\w+\\b", output: "ada@example.com", note: "email-shaped token" },
        { input: "(\\d{4})-(\\d{2})", output: "$2/$1", note: "reorder with groups" },
        { input: "\\s+", output: "collapse runs of whitespace", note: "replacement mode" },
      ],
      limits:
        "This is JavaScript's regex flavour, not PCRE, Python or .NET: lookbehind support depends on the browser, and possessive quantifiers and recursion are unavailable. Catastrophic backtracking cannot be interrupted on the main thread, so keep test text short.",
      faqs: [
        {
          q: "Why does my pattern match nothing here but work elsewhere?",
          a: "Regex flavours differ. JavaScript lacks some PCRE constructs, and flags such as x (extended mode) do not exist. Check the error line first, then compare the flavour; the tester uses the same engine as the browser running it.",
        },
        {
          q: "What do the flags mean?",
          a: "g finds all matches, i ignores case, m makes ^ and $ match line boundaries, s lets a dot match newlines, u enables Unicode mode and y anchors at lastIndex. The tester passes the flags straight to JavaScript.",
        },
        {
          q: "Why is the match index important?",
          a: "The index is where the match starts in the original string, which is what you need when slicing or highlighting. Capture groups also report their own offsets in the match list.",
        },
      ],
    },
    related: ["diff-checker", "json-validator", "url-encoder"],
    og: { kicker: "Developer tools", value: "/pattern/g" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "subnet-calculator",
    name: "Subnet calculator",
    category: "network",
    intent: "calculate IPv4 and IPv6 subnet ranges from CIDR",
    seo: {
      title: "Subnet Calculator — CIDR, IPv4 and IPv6",
      description:
        "Enter an IPv4 or IPv6 CIDR block to get the network address, mask, wildcard, host range, broadcast and usable host count. Shows the binary explanation.",
    },
    content: {
      intro:
        "Paste an address with a prefix, such as 192.168.1.10/24 or 2001:db8::/48, and get the network, mask, host range and usable count. Both address families are handled, and IPv6 is shown expanded and compressed.",
      howItWorks: [
        "The prefix fixes the first N bits of the address; the remaining bits are host bits. The network address has every host bit set to zero, and the broadcast address (IPv4 only) has every host bit set to one. The mask is the prefix written as bits, and the wildcard is its inverse.",
        "For IPv4, usable hosts are all addresses except the network and broadcast addresses, except for /31 (two-point links) and /32 (a single host), where the convention differs. IPv6 has no broadcast address, so every address in the prefix is usable, including the all-zero subnet-router anycast address.",
      ],
      examples: [
        { input: "192.168.1.10/24", output: "192.168.1.0 – 192.168.1.255", note: "254 usable IPv4 hosts" },
        { input: "10.0.0.0/30", output: "10.0.0.0 – 10.0.0.3", note: "2 usable hosts" },
        { input: "2001:db8::/48", output: "2001:db8:0:0::/48", note: "no broadcast in IPv6" },
      ],
      limits:
        "This is arithmetic on the address block, not a check of whether the route is announced or the address is public. IPv4-mapped IPv6 addresses and zones such as fe80::1%eth0 are not interpreted; enter the bare address and prefix.",
      faqs: [
        {
          q: "Why are two addresses missing from my usable host count?",
          a: "In IPv4 the network address identifies the subnet and the broadcast address reaches every host, so neither is assigned to a host. A /24 therefore has 256 addresses but 254 usable ones; /31 and /32 are special cases.",
        },
        {
          q: "Does IPv6 have a broadcast address?",
          a: "No. IPv6 uses multicast instead, and the all-zeros address is the subnet-router anycast address rather than a reserved broadcast. The calculator therefore does not subtract two addresses from an IPv6 block.",
        },
        {
          q: "What is the wildcard mask used for?",
          a: "It is the bitwise inverse of the subnet mask, used by some access control lists and routing configurations. The calculator shows both so you can copy the right one without inverting bits by hand.",
        },
      ],
    },
    related: ["ip-lookup", "dns-lookup", "system-info"],
    og: { kicker: "Network & system", value: "/24 → 254 hosts" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "loan-calculator",
    name: "Loan calculator",
    category: "calculators",
    intent: "calculate loan payments and total interest",
    seo: {
      title: "Loan Calculator — Payment and Interest",
      description:
        "Calculate a fixed-rate loan payment, total interest and a full amortization schedule. Enter the amount, rate and term, then download the schedule as CSV.",
    },
    content: {
      intro:
        "Enter the amount, annual rate and term to get the monthly payment, the total interest and a full amortization schedule. The first months show how much of each payment goes to interest rather than principal.",
      howItWorks: [
        "The payment uses the standard annuity formula: P × r ÷ (1 − (1 + r)^−n), where r is the monthly rate (annual rate ÷ 12) and n is the number of monthly payments. A zero rate is handled separately because the formula divides by zero.",
        "The schedule applies the monthly rate to the remaining balance, subtracts the interest from the payment and puts the rest toward principal. The final row is adjusted by cents so rounding cannot leave a residual balance.",
      ],
      examples: [
        { input: "£20,000 at 6% for 5 years", output: "£386.66/month", note: "60 payments" },
        { input: "£20,000 at 0% for 5 years", output: "£333.33/month", note: "principal ÷ months" },
        { input: "£250,000 at 4.5% for 30 years", output: "£1,266.71/month", note: "interest is front-loaded" },
      ],
      limits:
        "This models a fixed-rate, fully amortizing loan with payments at the end of each month. It does not include arrangement fees, insurance, early-repayment charges, variable rates or extra payments. The result is an estimate, not a lender offer.",
      faqs: [
        {
          q: "Why is most of my early payment interest?",
          a: "Interest is charged on the outstanding balance, which is highest at the start. As the balance falls, the interest portion falls and more of each fixed payment reduces principal; the schedule makes that shift visible month by month.",
        },
        {
          q: "Is the annual rate the same as APR?",
          a: "No. The nominal annual rate is the interest rate before fees. APR includes many of the costs of borrowing, so it is usually higher. This calculator takes the nominal rate; compare APRs from lenders separately.",
        },
        {
          q: "Can I download the schedule?",
          a: "Yes. The full schedule can be exported as CSV, with one row per payment showing the payment, interest, principal and remaining balance, so it can be checked in a spreadsheet.",
        },
      ],
    },
    related: ["vat-calculator", "percentage-calculator", "tip-calculator"],
    og: { kicker: "Calculators", value: "P × r ÷ (1 − (1+r)^−n)" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "vat-calculator",
    name: "VAT calculator",
    category: "calculators",
    intent: "add or remove VAT from a price",
    seo: {
      title: "VAT Calculator — Add or Remove VAT",
      description:
        "Add VAT to a net price or remove it from a gross price at any rate. Shows net, VAT and gross with the exact reverse division, not a naive subtraction.",
    },
    content: {
      intro:
        "Enter an amount and a rate, then choose whether the figure already includes VAT. The calculator returns the net, the tax and the gross, and shows the division used to remove VAT correctly.",
      howItWorks: [
        "Adding VAT multiplies the net amount by (1 + rate ÷ 100). Removing VAT divides the gross amount by the same factor; subtracting the rate from the gross gives the wrong answer because the tax was calculated on the smaller net figure.",
        "Amounts are rounded to two decimal places at the end, and the working line shows the unrounded factor so a spreadsheet can reproduce it. Rates can be any percentage, including zero and decimals.",
      ],
      examples: [
        { input: "£100 net, 20% VAT", output: "£120 gross", note: "100 × 1.20" },
        { input: "£120 gross, 20% VAT", output: "£100 net", note: "120 ÷ 1.20, not 120 − 20%" },
        { input: "£80 net, 5% VAT", output: "£84 gross", note: "reduced rate example" },
      ],
      limits:
        "VAT rules differ by country and by goods or services; this is arithmetic, not tax advice. It assumes one rate for the whole amount and does not handle mixed-rate invoices, exemptions or rounding rules that tax authorities may prescribe.",
      faqs: [
        {
          q: "Why can't I just subtract the percentage from the gross?",
          a: "Because VAT was charged on the net, not the gross. Twenty percent of £120 is £24, but the VAT inside £120 at 20% is £20. Dividing by 1.20 reverses the multiplication correctly; subtraction does not.",
        },
        {
          q: "Is VAT the same as sales tax?",
          a: "No. VAT is collected at each stage of the supply chain with input credits, while a sales tax is usually charged once at the final sale. The arithmetic here works for either, but the legal rules are different.",
        },
        {
          q: "How should I round the VAT amount?",
          a: "Round the final amounts to the smallest currency unit, and check the rule where you file. This calculator rounds net, VAT and gross independently to two decimals, which is common but not universal for invoices.",
        },
      ],
    },
    related: ["percentage-calculator", "tip-calculator", "loan-calculator"],
    og: { kicker: "Calculators", value: "gross ÷ 1.20" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "iban-validator",
    name: "IBAN & BIC validator",
    category: "calculators",
    intent: "validate IBAN checksums and BIC formats",
    seo: {
      title: "IBAN Validator — Checksum and BIC",
      description:
        "Check an IBAN's structure and mod-97 checksum, see its country, check digits and BBAN, and validate a BIC/SWIFT code. Runs in the browser; nothing is sent.",
    },
    content: {
      intro:
        "Paste an IBAN to check its country, length and mod-97 checksum, and paste a BIC to check its structure. The tool formats the IBAN in groups of four and explains exactly which check failed.",
      howItWorks: [
        "An IBAN starts with a two-letter country code and two check digits, followed by the country-specific BBAN. Validation moves the first four characters to the end, converts letters to numbers (A = 10, B = 11, …), and takes the result modulo 97. A valid IBAN has a remainder of 1.",
        "The country length table catches transposed or missing characters before the checksum. A BIC is 8 or 11 characters: four for the bank, two for the country, two for the location and an optional three-character branch.",
      ],
      examples: [
        { input: "DE89 3704 0044 0532 0130 00", output: "Valid · Germany · 22 characters", note: "mod-97 = 1" },
        { input: "GB82 WEST 1234 5698 7654 32", output: "Valid · United Kingdom · 22 characters", note: "spaces are ignored" },
        { input: "DE89 3704 0044 0532 0130 01", output: "Invalid checksum", note: "one digit changed" },
      ],
      limits:
        "A valid checksum does not prove the account exists or belongs to anyone. This is a format and checksum check, not a bank lookup. Country lengths are included for common IBAN countries; an unknown country is checksum-checked but its length is not enforced.",
      faqs: [
        {
          q: "Can a valid IBAN still be wrong?",
          a: "Yes. The checksum only proves the characters are internally consistent. A well-formed IBAN for a closed account, or for an account at another bank, still passes. Only the bank can confirm that an account is open and belongs to the payee.",
        },
        {
          q: "What is the difference between IBAN and BIC?",
          a: "An IBAN identifies a specific account, including the bank and country. A BIC, also called a SWIFT code, identifies the bank or branch. International transfers usually need both, although SEPA payments often need only the IBAN.",
        },
        {
          q: "Is my IBAN sent to a server?",
          a: "No. Normalisation, length checks and the mod-97 calculation all run in your browser. The page makes no request with the value, and the URL does not include it.",
        },
      ],
    },
    related: ["percentage-calculator", "vat-calculator", "json-validator"],
    og: { kicker: "Calculators", value: "mod 97 = 1" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "color-contrast-checker",
    name: "Color contrast checker",
    category: "design",
    intent: "check WCAG contrast between two colors",
    seo: {
      title: "Color Contrast Checker — WCAG AA and AAA",
      description:
        "Check the contrast ratio between text and background colours, see AA and AAA verdicts for normal and large text, and find a nearby colour that passes.",
    },
    content: {
      intro:
        "Pick a text colour and a background to see the WCAG contrast ratio, the AA and AAA verdicts for normal and large text, and a preview at actual size. A suggested adjustment finds the nearest passing lightness.",
      howItWorks: [
        "Each colour is converted from sRGB to linear light, weighted by the relative luminance coefficients (0.2126 red, 0.7152 green, 0.0722 blue), then the ratio is (lighter + 0.05) ÷ (darker + 0.05). The result runs from 1:1 to 21:1.",
        "WCAG AA requires 4.5:1 for normal text and 3:1 for large text (18pt, or 14pt bold). AAA requires 7:1 and 4.5:1. The suggestion keeps the hue and saturation and searches lightness until the pair passes, so the result stays close to the original.",
      ],
      examples: [
        { input: "#000000 on #FFFFFF", output: "21:1", note: "maximum contrast" },
        { input: "#767676 on #FFFFFF", output: "4.54:1", note: "passes AA normal text" },
        { input: "#2DD4BF on #FFFFFF", output: "1.86:1", note: "fails; use for large graphics only" },
      ],
      limits:
        "The ratio describes colour contrast, not readability: font size, weight, letter spacing, glare and colour-vision differences also matter. The suggested colour is a starting point, not a full design review, and opacity is not modelled.",
      faqs: [
        {
          q: "What is the difference between AA and AAA?",
          a: "AA is the baseline in WCAG 2.2: 4.5:1 for normal text and 3:1 for large text. AAA is stricter: 7:1 for normal text and 4.5:1 for large text. Meeting AAA is not required for every page, but it is the safer target.",
        },
        {
          q: "Why does a colour look fine but fail the check?",
          a: "Human brightness perception is not linear in RGB values. A mid-grey can feel readable on white while sitting just under 4.5:1. The luminance formula weighs the channels the way human vision does, which is why the ratio is lower than it looks.",
        },
        {
          q: "Does contrast apply to buttons and icons?",
          a: "Yes. WCAG requires 3:1 for large text and for user-interface components and graphical objects needed to understand content. Normal body text still needs 4.5:1, or 7:1 for AAA.",
        },
      ],
    },
    related: ["color-palette-generator", "svg-editor", "image-compressor"],
    og: { kicker: "Design & media", value: "4.5:1 for AA" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "tip-calculator",
    name: "Tip calculator",
    category: "calculators",
    intent: "calculate a tip and split a bill",
    seo: {
      title: "Tip Calculator — Tip and Split the Bill",
      description:
        "Calculate a tip from the bill and percentage, split it between any number of people and round up if you want. Shows the tip, total and per-person amount.",
    },
    content: {
      intro:
        "Enter the bill, choose a tip percentage and the number of people. The calculator shows the tip, the total and what each person pays, with an optional round-up so the group leaves a whole amount.",
      howItWorks: [
        "The tip is the bill multiplied by the percentage, and the total is the sum. The per-person amount divides the total by the number of people. Round-up raises the total to the next whole currency unit before splitting, and the difference is shown as an extra.",
        "The arithmetic is currency-agnostic: it uses the symbols you type and rounds to two decimals. Percentages can be whole or fractional, and zero people falls back to one rather than dividing by zero.",
      ],
      examples: [
        { input: "80 bill, 20%, 4 people", output: "16 tip · 24 each", note: "96 total" },
        { input: "57.30 bill, 15%, 2 people", output: "8.60 tip · 32.95 each", note: "rounds at the end" },
        { input: "100 bill, 17.5%, 3 people, round up", output: "117.50 → 118 · 39.33 each", note: "whole total" },
      ],
      limits:
        "Tipping norms vary by country and service; this is arithmetic, not advice. It does not add tax, service charges or per-item splits, and it assumes one shared bill rather than separate orders.",
      faqs: [
        {
          q: "Should I tip on the pre-tax or post-tax amount?",
          a: "That is a local convention, not a mathematical rule. Many people tip on the pre-tax subtotal, while some calculate on the total. Enter whichever base you intend; the percentage applies to the number in the bill field.",
        },
        {
          q: "How does round-up work?",
          a: "Round-up raises the final total to the next whole unit, then splits that total. The extra is added to the tip and shown separately, so the group can see exactly how much it adds.",
        },
        {
          q: "Why does the per-person amount differ by a cent?",
          a: "Splitting an amount that is not divisible by the number of people leaves a remainder. The display rounds for readability; in practice one person pays a cent more or the group rounds the total up.",
        },
      ],
    },
    related: ["percentage-calculator", "vat-calculator", "loan-calculator"],
    og: { kicker: "Calculators", value: "tip ÷ people" },
    status: "live",
    added: date,
    updated: date,
  },
  {
    slug: "iso-duration-parser",
    name: "ISO 8601 duration parser",
    category: "converters",
    intent: "parse ISO 8601 durations and convert them to seconds",
    seo: {
      title: "ISO 8601 Duration Parser and Converter",
      description:
        "Parse an ISO 8601 duration such as P3Y6M4DT12H30M5S into years, months, days, hours, minutes and seconds, and convert between duration and total seconds.",
    },
    content: {
      intro:
        "Paste an ISO 8601 duration to see each component and an approximate total in seconds, or enter seconds to build a duration string. Calendar units are labelled so the approximation is never hidden.",
      howItWorks: [
        "The parser reads the P designator, then each number with its unit letter: Y, M (months before T), W, D, then after T: H, M (minutes) and S. The two M letters mean different things depending on whether T has appeared, which is the usual source of confusion.",
        "A numeric total needs fixed lengths, so the conversion uses 365 days per year, 30 days per month and 7 days per week. Those are averages, not calendar truth: a month can be 28–31 days and a year 365 or 366.",
      ],
      examples: [
        { input: "PT1H30M", output: "5,400 seconds", note: "90 minutes" },
        { input: "P1DT12H", output: "129,600 seconds", note: "36 hours" },
        { input: "P3Y6M4D", output: "≈ 1,261 days", note: "365/30-day convention" },
      ],
      limits:
        "ISO 8601 durations are not a fixed number of seconds when they contain months or years; the total shown is an approximation under a stated convention. Negative durations, recurring intervals and the alternative week-only form with other units are not interpreted.",
      faqs: [
        {
          q: "Why are there two M designators?",
          a: "Before the T, M means months; after the T, M means minutes. P1M is one month and PT1M is one minute. The parser switches meaning at the T and shows each component separately so the difference is explicit.",
        },
        {
          q: "How long is P1M in seconds?",
          a: "There is no single answer: a calendar month is 28 to 31 days. This tool uses 30 days for the numeric total and labels it as an assumption. For billing or scheduling, keep the calendar unit rather than converting it.",
        },
        {
          q: "Does ISO 8601 allow weeks with other units?",
          a: "The week designator is defined for week-based durations, and mixing weeks with other designators is not portable across parsers. This parser accepts W but treats it as seven days for the numeric total.",
        },
      ],
    },
    related: ["timestamp-converter", "unit-converter", "timezone-buddy"],
    og: { kicker: "Converters", value: "PT1H30M = 5400 s" },
    status: "live",
    added: date,
    updated: date,
  },
];
