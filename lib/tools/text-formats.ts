import yaml from "js-yaml";
import { marked } from "marked";

export const textFormats = ["json", "yaml", "csv", "xml", "markdown", "html", "text"] as const;
export type TextFormat = (typeof textFormats)[number];

export const formatLabels: Record<TextFormat, string> = {
  json: "JSON",
  yaml: "YAML",
  csv: "CSV",
  xml: "XML",
  markdown: "Markdown",
  html: "HTML",
  text: "Plain text",
};

type Doc =
  | { kind: "data"; value: unknown }
  | { kind: "html"; html: string }
  | { kind: "text"; text: string };

export interface ConvertResult {
  output: string;
  error: string | null;
}

/* ------------------------------------------------------------------ CSV */

export function parseCsv(source: string): string[][] {
  const text = source.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.filter((entry) => !(entry.length === 1 && entry[0] === ""));
}

function csvToData(source: string): unknown {
  const rows = parseCsv(source);
  if (rows.length === 0) throw new Error("The CSV has no rows.");
  const header = rows[0]!;
  if (rows.length === 1) return [Object.fromEntries(header.map((key) => [key, ""]))];
  return rows.slice(1).map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])));
}

function escapeCsv(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function dataToCsv(value: unknown): string {
  const rows = Array.isArray(value) ? value : [value];
  if (rows.length === 0) return "";
  if (Array.isArray(rows[0])) {
    return (rows as unknown[][])
      .map((row) => row.map((cell) => escapeCsv(String(cell ?? ""))).join(","))
      .join("\n");
  }
  if (typeof rows[0] !== "object" || rows[0] === null) {
    return rows.map((row) => escapeCsv(String(row))).join("\n");
  }
  const headers = Array.from(
    new Set(rows.flatMap((row) => (typeof row === "object" && row !== null ? Object.keys(row) : []))),
  );
  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of rows) {
    const record = row as Record<string, unknown>;
    lines.push(
      headers
        .map((key) => {
          const cell = record[key];
          if (cell === undefined || cell === null) return "";
          if (typeof cell === "object") return escapeCsv(JSON.stringify(cell));
          return escapeCsv(String(cell));
        })
        .join(","),
    );
  }
  return lines.join("\n");
}

/* ------------------------------------------------------------------- XML */

function xmlToData(source: string): unknown {
  const document = new DOMParser().parseFromString(source, "application/xml");
  const failure = document.querySelector("parsererror");
  if (failure) throw new Error("Malformed XML: the parser could not read the document.");

  function walk(element: Element): unknown {
    const children = Array.from(element.children);
    const attributes = Array.from(element.attributes);
    if (children.length === 0 && attributes.length === 0) return element.textContent?.trim() ?? "";
    const record: Record<string, unknown> = {};
    for (const attribute of attributes) record[`@${attribute.name}`] = attribute.value;
    if (children.length === 0) {
      record["#text"] = element.textContent?.trim() ?? "";
      return record;
    }
    for (const child of children) {
      const value = walk(child);
      const current = record[child.tagName];
      if (current === undefined) record[child.tagName] = value;
      else if (Array.isArray(current)) current.push(value);
      else record[child.tagName] = [current, value];
    }
    return record;
  }

  return { [document.documentElement.tagName]: walk(document.documentElement) };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dataToXml(value: unknown): string {
  function render(node: unknown, tag: string, depth: number): string {
    const indent = "  ".repeat(depth);
    if (Array.isArray(node)) return node.map((child) => render(child, tag, depth)).join("\n");
    if (node !== null && typeof node === "object") {
      const record = node as Record<string, unknown>;
      const attributes = Object.entries(record)
        .filter(([key]) => key.startsWith("@"))
        .map(([key, child]) => ` ${key.slice(1)}="${escapeXml(String(child))}"`)
        .join("");
      const children = Object.entries(record).filter(([key]) => !key.startsWith("@") && key !== "#text");
      const text = typeof record["#text"] === "string" ? record["#text"] : null;
      if (children.length === 0 && text === null) return `${indent}<${tag}${attributes} />`;
      if (children.length === 0) return `${indent}<${tag}${attributes}>${escapeXml(text ?? "")}</${tag}>`;
      const inner = children
        .map(([key, child]) =>
          Array.isArray(child)
            ? child.map((entry) => render(entry, key, depth + 1)).join("\n")
            : render(child, key, depth + 1),
        )
        .join("\n");
      return `${indent}<${tag}${attributes}>\n${text ? `${"  ".repeat(depth + 1)}${escapeXml(text)}\n` : ""}${inner}\n${indent}</${tag}>`;
    }
    return `${indent}<${tag}>${escapeXml(String(node ?? ""))}</${tag}>`;
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 1) {
      const [root, child] = entries[0]!;
      return `<?xml version="1.0" encoding="UTF-8"?>\n${render(child, root, 0)}`;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${render(value, "root", 0)}`;
}

/* ------------------------------------------------------------ conversions */

function parseSource(source: string, format: TextFormat): Doc {
  switch (format) {
    case "json":
      return { kind: "data", value: JSON.parse(source) };
    case "yaml":
      return { kind: "data", value: yaml.load(source) ?? null };
    case "csv":
      return { kind: "data", value: csvToData(source) };
    case "xml":
      return { kind: "data", value: xmlToData(source) };
    case "markdown":
      return { kind: "html", html: marked.parse(source, { async: false }) as string };
    case "html": {
      const document = new DOMParser().parseFromString(source, "text/html");
      return { kind: "html", html: document.body.innerHTML };
    }
    case "text":
      return { kind: "text", text: source };
  }
}

function htmlToText(source: string): string {
  const document = new DOMParser().parseFromString(source, "text/html");
  return (document.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

function dataToText(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function convertText(source: string, from: TextFormat, to: TextFormat): ConvertResult {
  if (!source.trim()) return { output: "", error: null };
  if (from === to) return { output: source, error: null };

  let doc: Doc;
  try {
    doc = parseSource(source, from);
  } catch (error) {
    return {
      output: "",
      error: `${formatLabels[from]} input: ${error instanceof Error ? error.message : "could not be parsed."}`,
    };
  }

  try {
    if (doc.kind === "data") {
      switch (to) {
        case "json":
          return { output: JSON.stringify(doc.value, null, 2), error: null };
        case "yaml":
          return { output: yaml.dump(doc.value, { indent: 2, lineWidth: 100 }), error: null };
        case "csv":
          return { output: dataToCsv(doc.value), error: null };
        case "xml":
          return { output: dataToXml(doc.value), error: null };
        case "text":
          return { output: dataToText(doc.value), error: null };
        case "html":
          return {
            output: `<pre>${escapeXml(JSON.stringify(doc.value, null, 2))}</pre>`,
            error: null,
          };
        case "markdown":
          return { output: "```json\n" + JSON.stringify(doc.value, null, 2) + "\n```", error: null };
      }
    }

    if (doc.kind === "html") {
      switch (to) {
        case "html":
          return { output: doc.html, error: null };
        case "text":
          return { output: htmlToText(doc.html), error: null };
        default:
          return {
            output: "",
            error: `HTML to ${formatLabels[to]} is not supported. Convert HTML to plain text, then rebuild the structure.`,
          };
      }
    }

    switch (to) {
      case "text":
        return { output: doc.text, error: null };
      case "html":
        return {
          output: doc.text
            .split(/\n{2,}/)
            .map((paragraph) => `<p>${escapeXml(paragraph).replace(/\n/g, "<br />")}</p>`)
            .join("\n"),
          error: null,
        };
      default:
        return {
          output: "",
          error: `Plain text to ${formatLabels[to]} is not supported. Start from JSON, YAML, CSV or XML.`,
        };
    }
  } catch (error) {
    return { output: "", error: error instanceof Error ? error.message : "Conversion failed." };
  }
}
