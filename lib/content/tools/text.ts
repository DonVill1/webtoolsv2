import type { ToolDefinition } from "../types";

const date = "2026-10-28";

export const textTools: ToolDefinition[] = [
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem ipsum generator",
    category: "text",
    intent: "generate lorem ipsum placeholder text",
    seo: {
      title: "Lorem Ipsum Generator — Paragraphs, Sentences",
      description:
        "Generate Lorem ipsum placeholder text by paragraph and sentence count. Choose the classic opening, then copy or download the result.",
    },
    content: {
      intro:
        "Placeholder text in the shape your layout needs: a number of paragraphs, each with a fixed number of sentences, starting with the classic opening or a random passage.",
      howItWorks: [
        "The generator draws from the standard Lorem ipsum word set and assembles sentences of varied length, then wraps them into paragraphs. Paragraph and sentence counts are exact; each sentence is 8–19 words, so the total word count varies and is shown after generation.",
        "The classic opening — 'Lorem ipsum dolor sit amet…' — is used when the option is on. Turning it off starts from a random point in the passage, which is useful when several blocks sit on the same page.",
      ],
      examples: [
        { input: "2 paragraphs, 4 sentences", output: "two blocks, four sentences each" },
        { input: "Word count", output: "measured after generation", note: "not a requested count" },
      ],
      limits:
        "This is Latin-derived filler, not real Latin and not meaningful copy. Do not use it as a final content substitute; it exists to show typography and layout.",
      faqs: [
        {
          q: "Why is Lorem ipsum used?",
          a: "It has a natural-looking word-length distribution and no meaningful content, so reviewers focus on layout rather than reading the copy.",
        },
        {
          q: "Can I get an exact word count?",
          a: "Not directly. Choose the number of paragraphs and sentences; the measured word count appears after generation so you can adjust the settings.",
        },
        {
          q: "Is the text stored?",
          a: "No. Generation runs locally in the tab and nothing is sent to the server; the text exists only until you copy or download it.",
        },
      ],
    },
    related: ["test-data-generator", "text-analyzer", "markdown-editor"],
    og: { kicker: "Text & time", value: "paragraphs · sentences" },
    status: "live",
    added: "2023-09-01",
    updated: date,
  },
  {
    slug: "test-data-generator",
    name: "Test data generator",
    category: "text",
    intent: "generate fake names emails and addresses for testing",
    seo: {
      title: "Test Data Generator — Names, Emails, Addresses",
      description:
        "Generate realistic sample names, emails, phone numbers and addresses as JSON, CSV or SQL. Deterministic seeds keep fixtures repeatable.",
    },
    content: {
      intro:
        "Create sample records for fixtures and demos: names, emails, phones, addresses and dates, exported as JSON, CSV or SQL inserts.",
      howItWorks: [
        "Records are assembled from fixed name and address pools with a seeded random generator. The same seed produces the same records, which matters when a test compares output across runs.",
        "Emails and phone numbers are generated in clearly reserved or example ranges so a test suite cannot accidentally message a real person. The JSON export keeps stable key order.",
      ],
      examples: [
        { input: "10 rows, seed 42", output: "same 10 records every run", note: "deterministic" },
        { input: "CSV export", output: "header row + one row per record" },
      ],
      limits:
        "The data is fictional and does not model a real population. Phone numbers stay inside the 555-0100–0199 example block, and addresses are not deliverable. Do not load the output into a production database.",
      faqs: [
        {
          q: "What does the seed do?",
          a: "It fixes the random sequence, so the same seed and settings produce identical output. Change the seed to get a different data set.",
        },
        {
          q: "Are the emails real?",
          a: "No. They use reserved example domains so a test cannot reach a real inbox.",
        },
        {
          q: "Can I generate SQL inserts?",
          a: "Yes. Each row becomes an INSERT for a table named test_data, with strings quoted and escaped. It is literal SQL, not a parameterised query.",
        },
      ],
    },
    related: ["lorem-ipsum-generator", "uuid-generator", "json-validator"],
    og: { kicker: "Text & time", value: "JSON · CSV · SQL" },
    status: "live",
    added: "2023-09-01",
    updated: date,
  },
  {
    slug: "markdown-editor",
    name: "Markdown editor",
    category: "text",
    intent: "write and preview markdown",
    seo: {
      title: "Markdown Editor — Live Preview and Export",
      description:
        "Write Markdown in a split editor with live preview, see word counts, and download the .md file or copy the rendered HTML.",
    },
    content: {
      intro:
        "A two-pane Markdown editor: source on the left, rendered preview on the right, with a word count and both raw and HTML export.",
      howItWorks: [
        "The source is rendered with a CommonMark-compatible parser on every change. The preview sanitises raw HTML blocks, so pasted markup does not execute scripts.",
        "The editor tracks word and character counts and the reading time at 220 words per minute. Export downloads a .md file, and copy places the rendered HTML on the clipboard.",
      ],
      examples: [
        { input: "# Title\\n\\n- one\\n- two", output: "<h1>Title</h1><ul><li>one</li><li>two</li></ul>" },
      ],
      limits:
        "GitHub-flavoured extras such as tables and task lists are supported, but MDX components and footnote syntax are not. The preview is a rendering aid, not a full CommonMark conformance suite.",
      faqs: [
        {
          q: "Is the draft saved?",
          a: "It is kept in the tab. If you reload, the editor restores from local storage; nothing is sent to a server.",
        },
        {
          q: "Can I paste HTML?",
          a: "Yes, but raw HTML in the source is sanitised before preview so scripts cannot run. Use HTML export when you need the rendered markup.",
        },
        {
          q: "Does it support tables?",
          a: "Yes. GitHub-style pipe tables render in the preview, including alignment rows. They are a GFM extension, not part of strict CommonMark.",
        },
      ],
    },
    related: ["text-converter", "text-analyzer", "diff-checker"],
    og: { kicker: "Text & time", value: "source → preview" },
    status: "live",
    added: "2023-05-15",
    updated: date,
  },
  {
    slug: "text-analyzer",
    name: "Text analyzer",
    category: "text",
    intent: "count words characters and readability",
    seo: {
      title: "Text Analyzer — Word Count and Readability",
      description:
        "Count words, characters, sentences and paragraphs, see reading time, the most frequent words and a Flesch reading-ease score.",
    },
    content: {
      intro:
        "Paste text to get the counts that matter for editing: words, characters with and without spaces, sentences, paragraphs and reading time, plus a readability score.",
      howItWorks: [
        "Words are sequences of Unicode letters, numbers, apostrophes and hyphens; sentences are split on terminal punctuation followed by a space or the end of the text. Reading time uses 220 words per minute, a commonly used average for adult prose.",
        "Flesch reading ease is 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words). Syllables are estimated with a vowel-group heuristic, so the score is a guide rather than an exact linguistic measure.",
      ],
      examples: [
        { input: "A short paragraph.", output: "3 words · 1 sentence", note: "reading time < 1 min" },
      ],
      limits:
        "The syllable estimate is English-oriented and will mis-score technical terms, names and non-English text. Keyword frequency ignores stemming, so 'convert' and 'converting' count separately.",
      faqs: [
        {
          q: "What is a good Flesch score?",
          a: "60–70 is plain English, 50–60 is fairly difficult, and below 30 is very difficult. For reference documentation, 50–65 is a reasonable target.",
        },
        {
          q: "How is reading time calculated?",
          a: "Word count divided by 220 words per minute, rounded up to the nearest minute for display.",
        },
        {
          q: "Is the text uploaded?",
          a: "No. Analysis runs in the tab and nothing is sent to a server; the text disappears when the tab closes.",
        },
      ],
    },
    related: ["markdown-editor", "text-converter", "lorem-ipsum-generator"],
    og: { kicker: "Text & time", value: "words · readability" },
    status: "live",
    added: "2023-03-15",
    updated: date,
  },
  {
    slug: "timezone-buddy",
    name: "Time zone planner",
    category: "text",
    intent: "compare times across time zones and plan meetings",
    seo: {
      title: "Time Zone Planner — Compare Cities & Meetings",
      description:
        "Compare current times across cities and find an hour that works for everyone. See working hours and the day shift at a glance.",
    },
    content: {
      intro:
        "Add the cities in a meeting and see their current times side by side, with a weekday 09:00–18:00 marker so an unreasonable hour is obvious before you send the invite.",
      howItWorks: [
        "Each city is mapped to an IANA time-zone identifier, not a fixed UTC offset, so daylight-saving changes are handled by the browser's time-zone database. Times update every second from the device clock.",
        "Each row is marked as working hours, awake or night using 09:00–18:00 on weekdays. The date is shown beside the time, so the day shift at the date line is visible.",
      ],
      examples: [
        { input: "London · New York · Tokyo", output: "working together: none", note: "three-way spread" },
        { input: "Berlin · Lisbon", output: "working hours: 09:00–18:00", note: "one-hour offset" },
      ],
      limits:
        "The planner uses the browser's time-zone data, which can lag a government change until the browser updates. It does not read your calendar or account for travel.",
      faqs: [
        {
          q: "Does it handle daylight saving?",
          a: "Yes. Cities are stored as IANA zones, so the offset changes automatically on the local DST dates rather than being fixed.",
        },
        {
          q: "Why is the day different for Tokyo?",
          a: "The date line means Tokyo can already be on the next calendar day while New York is on the previous one. The planner labels the day shift.",
        },
        {
          q: "Can I share a meeting time?",
          a: "Not yet. The view is local to the tab; URL sharing is not implemented. Copy the table if you need to send the result to someone else.",
        },
      ],
    },
    related: ["timestamp-converter", "birthday-countdown", "percentage-calculator"],
    og: { kicker: "Text & time", value: "cities · working hours" },
    status: "live",
    added: "2023-07-10",
    updated: date,
  },
];
