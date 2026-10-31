"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

type Line = { type: "same" | "add" | "remove"; text: string; oldLine?: number; newLine?: number };

function diffLines(before: string, after: string): Line[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const max = 2000;
  if (a.length > max || b.length > max) {
    throw new Error(`Each side is limited to ${max} lines.`);
  }

  const rows = a.length;
  const cols = b.length;
  const matrix: number[][] = Array.from({ length: rows + 1 }, () => new Array<number>(cols + 1).fill(0));

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      matrix[i]![j] = a[i] === b[j] ? matrix[i + 1]![j + 1]! + 1 : Math.max(matrix[i + 1]![j]!, matrix[i]![j + 1]!);
    }
  }

  const lines: Line[] = [];
  let i = 0;
  let j = 0;
  let oldLine = 1;
  let newLine = 1;

  while (i < rows && j < cols) {
    if (a[i] === b[j]) {
      lines.push({ type: "same", text: a[i]!, oldLine, newLine });
      i += 1;
      j += 1;
      oldLine += 1;
      newLine += 1;
    } else if (matrix[i + 1]![j]! >= matrix[i]![j + 1]!) {
      lines.push({ type: "remove", text: a[i]!, oldLine });
      i += 1;
      oldLine += 1;
    } else {
      lines.push({ type: "add", text: b[j]!, newLine });
      j += 1;
      newLine += 1;
    }
  }
  while (i < rows) {
    lines.push({ type: "remove", text: a[i]!, oldLine });
    i += 1;
    oldLine += 1;
  }
  while (j < cols) {
    lines.push({ type: "add", text: b[j]!, newLine });
    j += 1;
    newLine += 1;
  }
  return lines;
}

const sampleA = `The quick brown fox\njumps over the lazy dog.\nSecond line stays.\nThird line is removed.`;
const sampleB = `The quick brown fox\nleaps over the lazy dog.\nSecond line stays.\nA new fourth line.`;

export default function DiffChecker() {
  const [before, setBefore] = useState(sampleA);
  const [after, setAfter] = useState(sampleB);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const result = useMemo(() => {
    try {
      const lines = diffLines(
        ignoreWhitespace ? before.replace(/[ \t]+/g, " ").trim() : before,
        ignoreWhitespace ? after.replace(/[ \t]+/g, " ").trim() : after,
      );
      const added = lines.filter((line) => line.type === "add").length;
      const removed = lines.filter((line) => line.type === "remove").length;
      return { lines, added, removed, error: null as string | null };
    } catch (error) {
      return { lines: [] as Line[], added: 0, removed: 0, error: error instanceof Error ? error.message : "Diff failed" };
    }
  }, [before, after, ignoreWhitespace]);

  const patch = result.lines
    .filter((line) => line.type !== "same")
    .map((line) => `${line.type === "add" ? "+" : "-"} ${line.text}`)
    .join("\n");

  return (
    <div className="tool-panel">
      <div className="grid-2">
        <div className="field">
          <label htmlFor="diff-before">Original</label>
          <textarea
            id="diff-before"
            className="textarea"
            style={{ minHeight: 150 }}
            spellCheck={false}
            value={before}
            onChange={(event) => setBefore(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="diff-after">Changed</label>
          <textarea
            id="diff-after"
            className="textarea"
            style={{ minHeight: 150 }}
            spellCheck={false}
            value={after}
            onChange={(event) => setAfter(event.target.value)}
          />
        </div>
      </div>

      <div className="row-wrap" style={{ marginTop: 12, justifyContent: "space-between" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(event) => setIgnoreWhitespace(event.target.checked)}
          />
          Collapse runs of spaces and trim
        </label>
        <div className="micro">
          <span className="ok-text">+{result.added}</span> · <span className="error-text">−{result.removed}</span>
        </div>
      </div>

      {result.error ? (
        <p className="error-text" style={{ marginTop: 12 }}>{result.error}</p>
      ) : (
        <div className="diff" style={{ marginTop: 14 }} role="table" aria-label="Line differences">
          {result.lines.map((line, index) => (
            <div
              key={`${line.type}-${index}`}
              className={`diff-line ${line.type === "add" ? "diff-add" : line.type === "remove" ? "diff-del" : ""}`}
              role="row"
            >
              <span className="diff-num">{line.oldLine ?? ""}</span>
              <span className="diff-num">{line.newLine ?? ""}</span>
              <span className="diff-mark">{line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}</span>
              <span className="diff-text">{line.text || " "}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <CopyButton value={patch} label="Copy changes" />
        <button type="button" className="btn btn-sm" onClick={() => { setBefore(after); setAfter(before); }}>
          Swap sides
        </button>
      </div>

      <p className="micro" style={{ marginTop: 12 }}>
        Line-based longest-common-subsequence diff, computed locally. 2,000 lines per side.
      </p>
    </div>
  );
}
