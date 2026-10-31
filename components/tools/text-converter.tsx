"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import {
  convertText,
  formatLabels,
  textFormats,
  type TextFormat,
} from "@/lib/tools/text-formats";
import { useToolView } from "./useToolView";

const pairs: Record<string, [TextFormat, TextFormat]> = {
  "json-yaml": ["json", "yaml"],
  "yaml-json": ["yaml", "json"],
  "json-csv": ["json", "csv"],
  "csv-json": ["csv", "json"],
  "xml-json": ["xml", "json"],
  "markdown-html": ["markdown", "html"],
};

const samples: Partial<Record<TextFormat, string>> = {
  json: '{\n  "name": "Ada Lovelace",\n  "born": 1815,\n  "skills": ["mathematics", "writing"]\n}',
  yaml: "name: Ada Lovelace\nborn: 1815\nskills:\n  - mathematics\n  - writing\n",
  csv: "name,role,year\nAda Lovelace,Mathematician,1815\nGrace Hopper,Computer scientist,1906\n",
  xml: '<person><name>Ada Lovelace</name><born>1815</born></person>',
  markdown: "# Notes\n\nA **short** paragraph with a [link](https://example.com).\n\n- first\n- second\n",
  html: "<h1>Notes</h1><p>A <strong>short</strong> paragraph with a <a href=\"https://example.com\">link</a>.</p>",
  text: "Plain text is left exactly as written.\n\nBlank lines stay blank.",
};

export default function TextConverter() {
  const { view } = useToolView("text-converter");
  const pair = pairs[view] ?? pairs["json-yaml"]!;
  const [manual, setManual] = useState<{ view: string; from: TextFormat; to: TextFormat } | null>(null);
  const active = manual && manual.view === view ? manual : { view, from: pair[0], to: pair[1] };
  const from = active.from;
  const to = active.to;
  // One draft per tab: switching a tab never overwrites what was typed in
  // another, and each tab starts with a sample in the right source format.
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(pairs).map(([id, [source]]) => [id, samples[source] ?? ""])),
  );
  const input = drafts[view] ?? "";
  const setInput = (value: string) => setDrafts((current) => ({ ...current, [view]: value }));

  const result = useMemo(() => convertText(input, from, to), [input, from, to]);

  function changeFrom(next: TextFormat) {
    setManual({ view, from: next, to });
    if (samples[next]) setInput(samples[next]!);
  }

  function changeTo(next: TextFormat) {
    setManual({ view, from, to: next });
  }

  function download() {
    const blob = new Blob([result.output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted.${to === "markdown" ? "md" : to === "text" ? "txt" : to}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ marginBottom: 12 }}>
        <div className="field grow">
          <label htmlFor="tc-from">From</label>
          <select id="tc-from" className="select" value={from} onChange={(event) => changeFrom(event.target.value as TextFormat)}>
            {textFormats.map((format) => (
              <option key={format} value={format}>
                {formatLabels[format]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          onClick={() => {
            setManual({ view, from: to, to: from });
            setInput(result.output);
          }}
          aria-label="Swap formats"
        >
          ⇄
        </button>
        <div className="field grow">
          <label htmlFor="tc-to">To</label>
          <select id="tc-to" className="select" value={to} onChange={(event) => changeTo(event.target.value as TextFormat)}>
            {textFormats.map((format) => (
              <option key={format} value={format}>
                {formatLabels[format]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="tc-input">{formatLabels[from]} input</label>
          <textarea
            id="tc-input"
            className="textarea"
            style={{ minHeight: 220 }}
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="field-label">{formatLabels[to]} output</span>
            <CopyButton value={result.output} label="Copy" />
          </div>
          <pre className="output" style={{ minHeight: 220 }} aria-live="polite">
            {result.error ? "" : result.output || "Output appears here as you type."}
          </pre>
        </div>
      </div>

      {result.error ? <p className="error-text" style={{ marginTop: 12 }}>{result.error}</p> : null}

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-sm" onClick={() => setInput("")}>
          Clear
        </button>
        <button type="button" className="btn btn-sm" onClick={download} disabled={!result.output}>
          Download output
        </button>
        {samples[from] ? (
          <button type="button" className="btn btn-sm" onClick={() => setInput(samples[from] ?? "")}>
            Load sample
          </button>
        ) : null}
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        XML attributes are kept as <code>@name</code> keys, text as <code>#text</code>; mixed content and namespaces
        are flattened. Markdown converts to HTML, and HTML to plain text — not the reverse.
      </p>
    </div>
  );
}
