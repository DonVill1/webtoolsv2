"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

const FIRST = ["Ada", "Grace", "Alan", "Katherine", "Linus", "Margaret", "Nikola", "Hedy", "Tim", "Barbara", "Guido", "Radia"];
const LAST = ["Lovelace", "Hopper", "Turing", "Johnson", "Torvalds", "Hamilton", "Tesla", "Lamarr", "Berners-Lee", "Liskov", "Rossum", "Perlman"];
const COMPANIES = ["Northwind Labs", "Acme Systems", "Harbor & Finch", "Vector Works", "Blue Oak Studio", "Meridian Data"];
const TITLES = ["Engineer", "Designer", "Analyst", "Researcher", "Writer", "Operator"];
const CITIES = ["Lisbon", "Austin", "Osaka", "Berlin", "Toronto", "Nairobi", "Montevideo", "Seoul"];
const STREETS = ["Harbour Road", "Market Street", "Cedar Lane", "Kingsway", "Willow Court", "Station Approach"];
const DOMAINS = ["example.com", "example.org", "test.example"];

const FIELDS = [
  { id: "id", label: "ID" },
  { id: "name", label: "Full name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "company", label: "Company" },
  { id: "jobTitle", label: "Job title" },
  { id: "address", label: "Address" },
  { id: "city", label: "City" },
  { id: "date", label: "Date" },
  { id: "active", label: "Boolean" },
  { id: "score", label: "Number" },
  { id: "uuid", label: "UUID" },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateRows(count: number, seed: number, fields: FieldId[]): Array<Record<string, unknown>> {
  const random = mulberry32(seed);
  const pick = <T,>(items: T[]): T => items[Math.floor(random() * items.length)]!;
  const digits = (length: number) => Array.from({ length }, () => Math.floor(random() * 10)).join("");
  const uuid = () => {
    const hex = Array.from({ length: 32 }, () => Math.floor(random() * 16).toString(16)).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
  };

  return Array.from({ length: count }, (_, index) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const row: Record<string, unknown> = {};
    for (const field of fields) {
      switch (field) {
        case "id":
          row.id = index + 1;
          break;
        case "name":
          row.name = `${first} ${last}`;
          break;
        case "email":
          row.email = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@${pick(DOMAINS)}`;
          break;
        case "phone":
          row.phone = `+1 555 01${digits(2)} ${digits(4)}`;
          break;
        case "company":
          row.company = pick(COMPANIES);
          break;
        case "jobTitle":
          row.jobTitle = `${pick(["Senior", "Staff", "Lead", ""])} ${pick(TITLES)}`.trim();
          break;
        case "address":
          row.address = `${1 + Math.floor(random() * 240)} ${pick(STREETS)}`;
          break;
        case "city":
          row.city = pick(CITIES);
          break;
        case "date": {
          const start = Date.UTC(2023, 0, 1);
          row.date = new Date(start + Math.floor(random() * 900) * 86_400_000).toISOString().slice(0, 10);
          break;
        }
        case "active":
          row.active = random() > 0.35;
          break;
        case "score":
          row.score = Math.round(random() * 1000) / 10;
          break;
        case "uuid":
          row.uuid = uuid();
          break;
      }
    }
    return row;
  });
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (value: unknown) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

function toSql(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const columns = headers.map((header) => `"${header}"`).join(", ");
  const literal = (value: unknown) => {
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    return `'${String(value ?? "").replace(/'/g, "''")}'`;
  };
  return rows
    .map((row) => `INSERT INTO test_data (${columns}) VALUES (${headers.map((header) => literal(row[header])).join(", ")});`)
    .join("\n");
}

export default function TestDataGenerator() {
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(42);
  const [format, setFormat] = useState<"json" | "csv" | "sql">("json");
  const [selected, setSelected] = useState<FieldId[]>(["id", "name", "email", "company", "date", "active"]);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);

  const output = format === "json" ? JSON.stringify(rows, null, 2) : format === "csv" ? toCsv(rows) : toSql(rows);

  function toggle(field: FieldId) {
    setSelected((current) =>
      current.includes(field) ? current.filter((entry) => entry !== field) : [...current, field],
    );
  }

  function generate() {
    if (selected.length === 0) {
      setRows([]);
      return;
    }
    const ordered = FIELDS.map((field) => field.id).filter((field) => selected.includes(field));
    setRows(generateRows(count, seed, ordered));
  }

  function download() {
    const blob = new Blob([output], {
      type: format === "json" ? "application/json" : format === "csv" ? "text/csv" : "application/sql",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `test-data.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field" style={{ width: 120 }}>
          <label htmlFor="data-count">Rows</label>
          <input
            id="data-count"
            className="input"
            type="number"
            min="1"
            max="200"
            value={count}
            onChange={(event) => setCount(Math.min(200, Math.max(1, Number(event.target.value) || 1)))}
          />
        </div>
        <div className="field" style={{ width: 120 }}>
          <label htmlFor="data-seed">Seed</label>
          <input
            id="data-seed"
            className="input"
            type="number"
            value={seed}
            onChange={(event) => setSeed(Number(event.target.value) || 1)}
          />
        </div>
        <div className="field" style={{ width: 130 }}>
          <label htmlFor="data-format">Format</label>
          <select id="data-format" className="select" value={format} onChange={(event) => setFormat(event.target.value as "json" | "csv" | "sql")}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="sql">SQL inserts</option>
          </select>
        </div>
        <button type="button" className="btn btn-primary" style={{ height: 44 }} onClick={generate}>
          Generate
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <span className="field-label">Fields</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 6 }}>
          {FIELDS.map((field) => (
            <label key={field.id} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={selected.includes(field.id)}
                onChange={() => toggle(field.id)}
              />
              {field.label}
            </label>
          ))}
        </div>
      </div>

      <p className="micro" style={{ marginTop: 10 }}>
        Same seed and fields produce the same rows — useful for fixtures. Names and domains are fictional.
      </p>

      <div className="output" style={{ marginTop: 14, minHeight: 180 }}>
        {rows.length === 0
          ? "No rows yet. Choose at least one field and generate."
          : output}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <CopyButton value={output} label="Copy data" />
        <button type="button" className="btn btn-sm" onClick={download} disabled={rows.length === 0}>
          Download .{format}
        </button>
        <span className="micro" style={{ alignSelf: "center" }}>
          {rows.length ? `${rows.length} rows · ${selected.length} fields` : ""}
        </span>
      </div>
    </div>
  );
}
