"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatBytes } from "@/lib/format";

interface ParseState {
  ok: boolean;
  error?: string;
  line?: number;
  column?: number;
  value?: unknown;
  stats?: { keys: number; arrays: number; depth: number; nodes: number };
}

function inspect(value: unknown): { keys: number; arrays: number; depth: number; nodes: number } {
  let keys = 0;
  let arrays = 0;
  let depth = 0;
  let nodes = 0;

  function walk(node: unknown, level: number) {
    nodes += 1;
    depth = Math.max(depth, level);
    if (Array.isArray(node)) {
      arrays += 1;
      node.forEach((child) => walk(child, level + 1));
    } else if (node && typeof node === "object") {
      for (const [, child] of Object.entries(node)) {
        keys += 1;
        walk(child, level + 1);
      }
    }
  }

  walk(value, 1);
  return { keys, arrays, depth, nodes };
}

function parseJson(text: string): ParseState {
  if (!text.trim()) return { ok: false, error: "Nothing to validate." };
  try {
    const value = JSON.parse(text);
    return { ok: true, value, stats: inspect(value) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const position = /position (\d+)/.exec(message);
    let line: number | undefined;
    let column: number | undefined;
    if (position?.[1]) {
      const index = Number(position[1]);
      const before = text.slice(0, index);
      line = before.split("\n").length;
      column = index - before.lastIndexOf("\n");
    }
    return { ok: false, error: message, line, column };
  }
}

export default function JsonValidator() {
  const [text, setText] = useState(
    '{\n  "name": "webtools",\n  "version": 2,\n  "tools": ["json-validator", "uuid-generator"],\n  "strict": true\n}',
  );
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const indentValue = indent === "tab" ? "\t" : Number(indent);

  const state = useMemo(() => parseJson(text), [text]);

  function format() {
    if (!state.ok) return;
    setOutput(JSON.stringify(state.value, null, indentValue));
  }

  function minify() {
    if (!state.ok) return;
    setOutput(JSON.stringify(state.value));
  }

  function sortKeys() {
    if (!state.ok) return;
    const sort = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === "object") {
        return Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, child]) => [key, sort(child)]),
        );
      }
      return value;
    };
    setOutput(JSON.stringify(sort(state.value), null, indentValue));
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div className="field" style={{ width: 110 }}>
          <label htmlFor="json-indent">Indent</label>
          <select id="json-indent" className="select" value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="1">1 space</option>
            <option value="tab">Tabs</option>
          </select>
        </div>
        <div className="tabs" style={{ alignSelf: "end" }}>
          <button type="button" className="tab" onClick={format} disabled={!state.ok}>
            Format
          </button>
          <button type="button" className="tab" onClick={minify} disabled={!state.ok}>
            Minify
          </button>
          <button type="button" className="tab" onClick={sortKeys} disabled={!state.ok}>
            Sort keys
          </button>
          <button type="button" className="tab" onClick={() => { setText(""); setOutput(""); }}>
            Clear
          </button>
        </div>
      </div>

      <label className="field-label" htmlFor="json-input">
        JSON input
      </label>
      <textarea
        id="json-input"
        className="textarea"
        style={{ minHeight: 200, marginTop: 6 }}
        spellCheck={false}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder='{ "hello": "world" }'
        aria-invalid={!state.ok && text.trim() !== ""}
      />

      <div role="status" aria-live="polite" style={{ marginTop: 10 }}>
        {state.ok ? (
          <p className="ok-text">
            Valid JSON · {state.stats?.nodes.toLocaleString("en-US")} values · {state.stats?.keys.toLocaleString("en-US")} keys ·{" "}
            {state.stats?.arrays.toLocaleString("en-US")} arrays · depth {state.stats?.depth}
          </p>
        ) : (
          <p className="error-text">
            {state.error}
            {state.line ? ` (line ${state.line}, column ${state.column})` : ""}
          </p>
        )}
      </div>

      <div className="micro" style={{ marginTop: 4 }}>
        {formatBytes(new Blob([text]).size)} · {text.split("\n").length.toLocaleString("en-US")} lines
      </div>

      {output ? (
        <>
          <div className="row-wrap" style={{ justifyContent: "space-between", marginTop: 16, marginBottom: 6 }}>
            <span className="field-label">Output</span>
            <div style={{ display: "flex", gap: 6 }}>
              <CopyButton value={output} label="Copy JSON" />
              <button type="button" className="btn btn-sm" onClick={() => setText(output)}>
                Use as input
              </button>
            </div>
          </div>
          <pre className="output" aria-label="Formatted JSON">
            {output}
          </pre>
        </>
      ) : null}

      <p className="micro" style={{ marginTop: 14 }}>
        JSON.parse accepts no comments or trailing commas. Error positions are reported at the exact character where
        parsing stopped.
      </p>
    </div>
  );
}
