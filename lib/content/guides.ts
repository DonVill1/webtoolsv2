import type { Guide } from "./types";

export const guides: Guide[] = [
  {
    slug: "feet-to-inches-exact-factor",
    title: "Feet to inches: the exact factor, and why 12 is not a guess",
    description:
      "The foot is defined through the metre, not the other way around. Here is the exact chain from the 1959 agreement to the 12 you multiply by.",
    topic: "conversions",
    publishedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    readingMinutes: 4,
    relatedTools: ["unit-converter", "percentage-calculator"],
    body: `Twelve inches in a foot is one of those facts that feels older than measurement itself. The number is right, but the reason it is *exactly* right is surprisingly recent: the international yard and pound agreement of 1959.

## The exact chain

The agreement fixed the international yard at exactly 0.9144 metres. A yard is three feet, so:

\`\`\`
1 ft = 0.9144 m ÷ 3 = 0.3048 m   (exact)
1 in = 0.3048 m ÷ 12 = 0.0254 m  (exact)
\`\`\`

Both values are exact decimals, not approximations. That is why a converter can say 1 ft = 12 in without a caveat: the inch and the foot are defined through the same metre, and the ratio collapses to an integer.

## The formula, both ways

\`\`\`
inches = feet × 12
feet   = inches ÷ 12
\`\`\`

There is no offset and no rounding step. A converter that rounds to two decimals in the middle of a chain will drift; one that multiplies once will not.

## A short table

| Feet | Inches |
| ---: | -----: |
| 1 | 12 |
| 2 | 24 |
| 3 | 36 |
| 5 | 60 |
| 10 | 120 |
| 100 | 1,200 |

The [feet to inches converter](/convert/length/feet-to-inches) applies the same factor to any decimal value, including fractions.

## Three places people get it wrong

**1. The survey foot.** The US survey foot was 1200/3937 m, about 0.3048006096 m — longer than the international foot by two parts per million. It was retired for most federal mapping at the end of 2022, but older datasets still contain it. If a conversion is off by a few centimetres across a kilometre, this is usually why.

**2. Rounding to 2.54 cm too early.** One inch is exactly 2.54 cm, so converting inches to centimetres is safe. The error appears when someone converts feet to centimetres by multiplying 30 (a rounded foot) and then continues from there.

**3. The double-prime symbol.** 5′ 10″ means five feet ten inches. A single prime is feet, a double prime is inches. Typing 5.10 into a decimal field means five point one feet, which is 5′ 1.2″ — a different height.

## Why the converter shows six figures

The [unit converter](/tools/unit-converter) keeps the unrounded value internally and formats only for display. Copying the result gives the full precision; the visible table is rounded for readability. That distinction matters when the output feeds another calculation rather than a person.`,
  },
  {
    slug: "km-to-miles",
    title: "Kilometres to miles: the exact factor and the 60 mph trap",
    description:
      "The mile is fixed at 1,609.344 metres. Here is the exact conversion, the running distances people actually search for, and where mph and km/h get confused.",
    topic: "conversions",
    publishedAt: "2026-10-28",
    updatedAt: "2026-10-28",
    readingMinutes: 4,
    relatedTools: ["unit-converter", "speed-test"],
    body: `A mile is not a round number of kilometres, and that is the whole source of the confusion. The international mile is exactly 1,609.344 metres, which makes one kilometre exactly 0.621371192237… miles. The decimal never terminates because 1,609.344 ÷ 1,000 does not simplify to a finite decimal.

## The exact relationship

\`\`\`
miles = kilometres × 0.621371192237334
kilometres = miles × 1.609344
\`\`\`

For everyday use, multiplying by 0.6214 is accurate to about one part in 25,000. Multiplying by 0.62 is convenient and about 0.2% low: on a 100 km drive that is a 200 m error, which is fine for a rough estimate and not fine for a race split.

## Distances runners actually search for

| Kilometres | Miles |
| ---: | ---: |
| 1 km | 0.6214 mi |
| 5 km | 3.1069 mi |
| 10 km | 6.2137 mi |
| 21.0975 km (half marathon) | 13.1094 mi |
| 42.195 km (marathon) | 26.2188 mi |

The [kilometres to miles converter](/convert/length/kilometres-to-miles) applies the exact factor to any value, including the decimal splits used in race results.

## The 60 mph trap

Road speeds are the place where a rough conversion becomes dangerous. 60 mph is 96.5606 km/h, not 100 km/h. A 100 km/h limit is 62.1371 mph. Drivers who use “60 mph ≈ 100 km/h” are close enough for a conversation and wrong enough to matter at the top of a limit.

The [kilometres per hour to miles per hour table](/convert/speed/kilometres-per-hour-to-miles-per-hour) covers the road-speed pair directly. A nautical mile is a different unit again: 1 nmi = 1,852 m exactly, which is why knots do not convert with the same factor as statute miles.

## Why the mile is 1,609.344 m

The international mile is 5,280 international feet, and the 1959 yard and pound agreement fixed the foot at exactly 0.3048 m. Multiply 5,280 by 0.3048 and the result is 1,609.344 m exactly. The mile is therefore a derived unit, not an independent standard.

## Rounding rules that avoid surprises

- Keep the full value in a calculation and round only the final display.
- For road signs and speedometers, assume the displayed value is rounded and do not use it as an exact input.
- For race results, use the exact factor: a marathon is 26.2188 miles, not 26.2.
- For navigation, do not substitute statute miles for nautical miles; the 15% difference is large.

If you need the reverse direction, the [miles to kilometres converter](/convert/length/miles-to-kilometres) uses the same definition, so the two pages cannot disagree.`,
  },
  {
    slug: "celsius-to-fahrenheit",
    title: "Celsius to Fahrenheit: formula, offset and mistakes",
    description:
      "Fahrenheit and Celsius do not share a zero point. Here is the exact formula, the values worth memorising, and why “double and add 30” is only a party trick.",
    topic: "conversions",
    publishedAt: "2026-10-28",
    updatedAt: "2026-10-28",
    readingMinutes: 4,
    relatedTools: ["unit-converter", "bmi-calculator"],
    body: `Celsius and Fahrenheit measure the same physical quantity with different zero points and different degree sizes. That makes the conversion affine: a scale factor plus an offset, not a single multiplication.

## The exact formulas

\`\`\`
°F = (°C × 9/5) + 32
°C = (°F − 32) × 5/9
\`\`\`

Both are exact. The 9/5 is the ratio of the degree sizes; the 32 is the difference between the freezing points. Apply the offset in the right order and the result is not an approximation.

## The fixed points

| Celsius | Fahrenheit | What it is |
| ---: | ---: | --- |
| -40 | -40 | The two scales meet |
| 0 | 32 | Water freezes at one atmosphere |
| 20 | 68 | A comfortable room |
| 37 | 98.6 | Average human body temperature |
| 100 | 212 | Water boils at one atmosphere |

The [Celsius to Fahrenheit converter](/convert/temperature/celsius-to-fahrenheit) is pre-set to 1 °C and keeps the unrounded value between steps. The reverse page is [Fahrenheit to Celsius](/convert/temperature/fahrenheit-to-celsius).

## Why “double and add 30” is not the formula

The shortcut °F ≈ (°C × 2) + 30 is easy to remember and close around room temperature. It is not the conversion. At 37 °C it gives 104 °F instead of 98.6 °F, a difference of more than five degrees. At -40 °C it gives -50 °F instead of -40 °F. Use it for a rough check, never for a medical reading, a recipe or a thermostat setting.

## Negative temperatures

The formula handles negatives without a special case. -40 °C is -40 °F because the two scales cross there. -10 °C is 14 °F, not -50 °F. The most common error is subtracting 32 in the wrong direction when converting Fahrenheit to Celsius; write the formula down before substituting a negative number.

## Kelvin is not a third Fahrenheit

Kelvin uses the same degree size as Celsius, with zero at absolute zero:

\`\`\`
K = °C + 273.15
°C = K − 273.15
\`\`\`

Kelvin has no degree symbol. A temperature of 300 K is 26.85 °C, not 300 °C. The [Kelvin conversion table](/convert/temperature/celsius-to-kelvin) shows the chain without asking you to remember the offset.

## What to round

Keep the unrounded value for any calculation that continues, and round only the number a person reads. A body temperature of 37 °C is 98.6 °F to one decimal place; 98.6000000001 °F and 98.6 °F are the same measurement.`,
  },
  {
    slug: "mbps-vs-mbs",
    title: "Mbit/s vs MB/s: why 100 Mbps downloads at 12.5 MB/s",
    description:
      "Bits and bytes are eight apart. Here is how to turn a broadband plan into a real download time, and why the missing speed is usually overhead, not a broken line.",
    topic: "conversions",
    publishedAt: "2026-10-28",
    updatedAt: "2026-10-28",
    readingMinutes: 4,
    relatedTools: ["unit-converter", "speed-test"],
    body: `Broadband is sold in megabits per second. Download counters usually show megabytes per second. One byte is eight bits, so the two numbers differ by a factor of eight before any network overhead is involved.

## The conversion

\`\`\`
1 MB/s = 8 Mbit/s
1 Mbit/s = 0.125 MB/s
\`\`\`

A 100 Mbit/s plan therefore has a theoretical ceiling of 12.5 MB/s. Seeing 11–12 MB/s in a browser is normal: protocol headers, TCP acknowledgement traffic and the server's own limits consume part of the line rate.

| Plan | Theoretical maximum |
| ---: | ---: |
| 50 Mbit/s | 6.25 MB/s |
| 100 Mbit/s | 12.5 MB/s |
| 500 Mbit/s | 62.5 MB/s |
| 1 Gbit/s | 125 MB/s |

The [megabits to megabytes per second converter](/convert/data-rate/megabits-per-second-to-megabytes-per-second) applies the factor of eight directly.

## Estimating a download

Divide the file size in megabytes by the throughput in megabytes per second. A 1.5 GB file is 1,500 MB in decimal units; on a 100 Mbit/s line the floor is 1,500 ÷ 12.5 = 120 seconds, or two minutes. Add overhead and server limits and a three-minute download is not a fault.

Use the same unit for both numbers. Dividing a 1,500 MB file by 100 Mbit/s gives 15, which is not a time in any unit. That unit mismatch is the most common reason a download estimate looks absurd.

## Why the labels are so easy to mix up

- **Mbit/s** uses a lowercase b for bit. Network equipment and ISPs use it.
- **MB/s** uses an uppercase B for byte. Operating systems and download managers use it.
- **Mb/s** and **MB/s** are not the same, and the difference is a factor of eight, not a typo.
- **MiB/s** is a binary unit: 1 MiB/s = 1,048,576 bytes per second, not 1,000,000.

The [data rate conversion tables](/convert/data-rate) keep bits, bytes and the SI/IEC distinction separate. The [speed test](/tools/speed-test) reports the measured line rate; a browser download is an end-to-end transfer and will usually be lower.

## The number to trust

A speed test measures the line. A download measures the line plus the server, the route and the protocol. If the speed test reports 100 Mbit/s and a download settles at 11 MB/s, the conversion says the line is behaving as sold. If the download is closer to 1 MB/s, the bottleneck is somewhere else.`,
  },
  {
    slug: "kg-to-lb",
    title: "Kilograms to pounds: exact factor, stones and mass",
    description:
      "One pound is exactly 0.45359237 kg. Here is the conversion both ways, the stone detour, and why a pound is not quite the weight you feel.",
    topic: "conversions",
    publishedAt: "2026-10-28",
    updatedAt: "2026-10-28",
    readingMinutes: 3,
    relatedTools: ["unit-converter", "bmi-calculator"],
    body: `The kilogram and the pound are both units of mass, and the international pound has been fixed against the kilogram since 1959. That makes the factor exact, even though the decimal is long.

## The exact factor

\`\`\`
1 lb = 0.45359237 kg   (exact)
1 kg = 2.2046226218… lb
\`\`\`

The kilogram-to-pound decimal does not terminate. Rounding to 2.2 is about 0.2% low; on a 100 kg value that is 200 g, which is fine for a suitcase and not fine for a medication dose.

## The table people actually need

| Kilograms | Pounds |
| ---: | ---: |
| 50 kg | 110.23 lb |
| 60 kg | 132.28 lb |
| 70 kg | 154.32 lb |
| 80 kg | 176.37 lb |
| 90 kg | 198.42 lb |
| 100 kg | 220.46 lb |

The [kilograms to pounds converter](/convert/weight/kilograms-to-pounds) keeps the unrounded value, so a body-weight entry does not drift when it is converted back.

## Stones are a third unit

A stone is 14 pounds, or exactly 6.35029318 kg. UK and Irish body weight is often written as “11 st 4 lb”: 11 × 14 + 4 = 158 lb. Convert that to kilograms once, rather than converting the stone and the pounds separately and adding rounded results.

## Mass is not weight

A pound is sometimes called a unit of weight, but the conversion is between masses. Weight is a force and depends on gravity; a 70 kg person has the same mass on the Moon and a different weight. For groceries, luggage and body weight the distinction rarely changes the number. For physics, it changes the unit.

## Where the rounding goes

Keep the full value when a number continues into another calculation. Round the final display to the precision of the input: 70 kg is 154.3 lb to one decimal place, and 154.3236 lb is the same mass with more digits than the scale measured.`,
  },
  {
    slug: "kb-vs-kib",
    title: "1 KB is not 1,024 bytes: a practical guide to SI and IEC",
    description:
      "Two standards, one confusing label. Why a 1 TB drive shows 931 GiB, and how to tell which number a tool is actually giving you.",
    topic: "conversions",
    publishedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    readingMinutes: 5,
    relatedTools: ["unit-converter", "image-compressor"],
    body: `There are two perfectly good ways to count bytes, and they disagree by 2.4% at the kilobyte, 4.9% at the megabyte and 10% at the terabyte. Most software picks one and labels it with the other.

## The two standards

**SI decimal** uses powers of 1,000: 1 kB = 1,000 B, 1 MB = 1,000,000 B.

**IEC binary** uses powers of 1,024: 1 KiB = 1,024 B, 1 MiB = 1,048,576 B.

The IEC prefixes (kibi, mebi, gibi) were introduced in 1998 precisely to end the ambiguity. They are unambiguous when used. The problem is that operating systems kept the old labels.

## Why your 1 TB drive shows 931 GiB

Drive manufacturers sell decimal terabytes: 1,000,000,000,000 bytes. Windows divides by 1,024 three times and prints the result with a "TB" label:

\`\`\`
1,000,000,000,000 ÷ 1024³ = 931.32 GiB
\`\`\`

Nothing is missing. The number is the same bytes, expressed in a different unit, under the wrong name.

## A table worth keeping

| Decimal (SI) | Bytes | Binary (IEC) | Bytes |
| --- | ---: | --- | ---: |
| 1 kB | 1,000 | 1 KiB | 1,024 |
| 1 MB | 1,000,000 | 1 MiB | 1,048,576 |
| 1 GB | 1,000,000,000 | 1 GiB | 1,073,741,824 |
| 1 TB | 1,000,000,000,000 | 1 TiB | 1,099,511,627,776 |

## What this site does

The [unit converter](/tools/unit-converter) exposes both sets as separate units. \`kB\` is decimal; \`KiB\` is binary. The [data size conversion tables](/convert/data) show the same distinction, and the note under the table spells out the exact factors.

This is more units than most tools show, and it is deliberate. A converter that offers one "KB" has to guess which one you meant. A converter that offers two does not.

## When it actually matters

- **Cloud billing** is almost always decimal, because providers bill per GB-month using 1,000.
- **Memory** is usually binary, because RAM is addressed in powers of two.
- **Network throughput** is decimal and in bits: 1 Gbps = 1,000,000,000 bits per second, which is 125 MB/s, not 128.
- **File sizes in an OS** are usually binary values with decimal labels.

If a number looks 7–10% off in a storage or bandwidth context, check which standard the source used before assuming a bug.`,
  },
  {
    slug: "base64-is-not-encryption",
    title: "Base64 is not encryption, and three other things it is not",
    description:
      "What Base64 actually guarantees, why the output is 4/3 the size, and the places it is genuinely the right tool.",
    topic: "encoding",
    publishedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    readingMinutes: 4,
    relatedTools: ["base64-encoder", "jwt-decoder", "hash-generator"],
    body: `Base64 turns arbitrary bytes into ASCII characters. It is an encoding, not a cipher, and the difference is the whole point.

## What it guarantees

Base64 guarantees that the output contains only 64 safe characters (plus padding). That is it. Anyone can decode it with no key, which is why it is safe for transporting a PNG through a text field and unsafe for hiding a password.

## Why the output is bigger

Six bits of data per character instead of eight means four characters carry three bytes. The output is therefore about 4/3 the input size, plus padding to a multiple of four.

\`\`\`
"hello" (5 bytes) → "aGVsbG8=" (8 characters)
\`\`\`

The [Base64 encoder](/tools/base64-encoder) shows the byte count alongside the output, so the overhead is visible rather than surprising.

## The URL-safe variant

Standard Base64 uses \`+\` and \`/\`, which have meaning inside a URL. URL-safe Base64 swaps them for \`-\` and \`_\` and drops the padding. JWTs use this variant, which is why a token segment can be pasted into a URL unchanged. The [JWT decoder](/tools/jwt-decoder) relies on the same conversion.

## Three things it is not

**Not compression.** It always makes data larger, never smaller.

**Not a checksum.** Any string that decodes to the right byte count is "valid"; Base64 cannot tell you whether the content was altered.

**Not a secret.** Encoding a token does not protect it. If the string is in a URL, a log or a browser history, it is public.

## Where it is the right tool

- Embedding a small image in CSS or JSON as a data URL.
- Sending binary over a transport that only accepts text, such as some mail and HTTP headers.
- Representing a key or signature inside a token format.
- Storing a small blob in a configuration file that must stay human-readable.

For integrity, use a [hash](/tools/hash-generator). For confidentiality, use encryption with a key. For passwords, use a password hash with a work factor — none of which is Base64.`,
  },
  {
    slug: "json-formatting-rules",
    title: "JSON formatting: what is valid, what is tolerated, what breaks",
    description:
      "Trailing commas, comments, duplicate keys and big integers. The rules that decide whether a file parses in a real runtime.",
    topic: "developer",
    publishedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    readingMinutes: 5,
    relatedTools: ["json-validator", "text-converter", "diff-checker"],
    body: `JSON looks like JavaScript object syntax. It is stricter, and the differences are exactly where most parse errors come from.

## The short list of rules

- Keys and strings use **double quotes** only. Single quotes are invalid.
- **No trailing commas** after the last member of an object or array.
- **No comments.** Neither \`//\` nor \`/* */\` is allowed.
- Numbers are decimal, with an optional exponent. \`NaN\`, \`Infinity\` and hex literals are invalid.
- The top level must be an object or an array. A bare string is valid JSON only as a complete document in the 2016+ grammar; many parsers reject it in practice.

## Duplicate keys

The specification says names *should* be unique. It does not forbid duplicates. When they appear, most parsers keep the last value and discard the earlier ones, silently. That is a data-loss bug waiting to happen, and a validator that only says "valid" will not catch it.

## The integer trap

JavaScript numbers are IEEE-754 doubles. Any integer above 2^53 − 1 (9,007,199,254,740,991) loses precision when parsed. A snowflake ID or a nanosecond timestamp pasted into a browser can change value without any error.

If the exact digits matter, send the value as a string. Most APIs that expose 64-bit IDs do exactly that.

## JSON5 is not JSON

JSON5 allows comments, single quotes, trailing commas and unquoted keys. It is a useful configuration format and a completely invalid JSON document. Renaming a \`.json5\` file to \`.json\` does not convert it.

The same applies to \`.jsonc\` files used by TypeScript and VS Code: comments are expected there and rejected by \`JSON.parse\`.

## Dates are strings

JSON has no date type. A timestamp is a string or a number, and the format is a convention rather than part of the specification. ISO 8601 is the safest choice because it sorts lexicographically and includes an offset.

## Checking a document

The [JSON validator](/tools/json-validator) uses the browser's own parser, so it accepts exactly what a JavaScript runtime accepts. It reports the line and column of the first error instead of a generic "invalid JSON".

For converting between JSON and neighbouring formats, the [text converter](/tools/text-converter) handles YAML, CSV and XML, and states where the round trip is lossy.`,
  },
  {
    slug: "how-we-test-conversions",
    title: "How we test conversions, rounding and the numbers on this site",
    description:
      "The methodology behind the factors, the golden-value tests, the display rules and the limits we publish on every tool page.",
    topic: "methodology",
    publishedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    readingMinutes: 4,
    relatedTools: ["unit-converter", "unit-converter", "percentage-calculator"],
    body: `A converter is only useful if you can check it. This page describes what is tested, what is rounded, and where the edges are.

## Factors are code, not copy

Conversion factors live in a typed registry in the repository, not in the CMS and not in a database row. That means an editor cannot change 0.45359237 into 0.453592, and a content update cannot silently change a number.

Every unit stores a function to and from its category's base unit. A conversion is one multiply and one divide, never a chain of intermediate units.

## Golden-value tests

The test suite asserts known values, including:

- 1 in = 25.4 mm exactly
- 1 lb = 0.45359237 kg exactly
- 0 °C = 32 °F and 100 °C = 212 °F
- 1 MiB = 1,048,576 bytes
- 1 kWh = 3,600,000 J

A change that breaks any of these fails the build before it can ship.

## Display versus storage

The internal value is never rounded. Display uses six significant figures by default, with scientific notation below 10⁻⁶ and above 10¹². Copying a result gives the unrounded value where the tool supports it.

This matters for chains: converting feet to inches and then inches to centimetres should give the same answer as converting feet to centimetres directly.

## What we do not claim

- **Average months and years.** A "month" is 30.436875 days and a "year" is 365.2425 days, labelled as averages. A calendar month is not a fixed duration, and no converter can make it one.
- **US customary versus imperial.** The volume units here are US customary. A UK gallon is 4.54609 L, not 3.785 L.
- **Approximate geolocation.** IP location is inferred from network allocation and is not a tracking method.
- **Hashes as encryption.** A hash is one-way and unsalted here; it is not a password store.

## Why the limits are on every page

Most tools hide their assumptions. We publish them because a wrong answer with no caveat is worse than a right answer with a boundary. If a limitation is not stated, it is a bug — the [unit converter](/tools/unit-converter) page lists the current ones.`,
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

export const guideTopics = Array.from(new Set(guides.map((guide) => guide.topic)));

export interface GuideTopicMeta {
  label: string;
  intro: string;
}

/** Hub copy per topic. Kept beside the guides so a new topic cannot ship without it. */
export const guideTopicMeta: Record<string, GuideTopicMeta> = {
  conversions: {
    label: "Conversions",
    intro:
      "Measurement conversions look trivial until a factor is rounded, a US gallon is mistaken for an imperial one, or a temperature is treated like a length. These guides cover the definitions behind the converters, the exact factors that make a result reproducible, and the assumptions that break when a unit is only approximately fixed.",
  },
  encoding: {
    label: "Encoding",
    intro:
      "Encoding is not encryption, and a decoder is not a verification tool. These guides explain what Base64 actually guarantees, where URL-safe alphabets come from, and why a JWT payload can be read by anyone even when its signature is valid. The practical rules are short; the failure modes are not.",
  },
  developer: {
    label: "Developer",
    intro:
      "The developer tools deal in formats that look forgiving and are not: JSON without comments, timestamps without leap seconds, hashes without secrecy, UUIDs without coordination. These guides state the rules the parsers enforce and the places where a plausible-looking value is still invalid.",
  },
  methodology: {
    label: "Methodology",
    intro:
      "How the numbers on this site are produced and checked: where factors come from, how results are rounded for display, what the tests assert, and which claims the tools deliberately do not make. Read this before treating an output as authoritative for a decision that matters.",
  },
};

export function guidesForTopic(topic: string): Guide[] {
  return guides.filter((guide) => guide.topic === topic);
}

export function guidesForTool(slug: string): Guide[] {
  return guides.filter((guide) => guide.relatedTools.includes(slug));
}
