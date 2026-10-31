"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { CopyButton } from "@/components/ui/CopyButton";

const sample = `# Release notes

A **focused** editor that renders as you type.

## What changed

- Reworked the conversion table
- Added keyboard-friendly controls
- Fixed \`SHA-1\` labelling

> Accuracy is a feature, not a footnote.

\`\`\`js
const result = convert(1, "m", "ft");
\`\`\`

See the [methodology](https://example.com/about) for the details.
`;

function sanitize(html: string): string {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script, style, iframe, object, embed, form, link, meta").forEach((node) => node.remove());
  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:")) element.removeAttribute(attribute.name);
    }
  });
  return document.body.innerHTML;
}

export default function MarkdownEditor() {
  const [source, setSource] = useState(sample);
  const [split, setSplit] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const html = useMemo(
    () => (mounted ? sanitize(marked.parse(source, { gfm: true, breaks: false }) as string) : ""),
    [source, mounted],
  );

  const stats = useMemo(() => {
    const words = source.trim() ? source.trim().split(/\s+/).length : 0;
    return {
      words,
      characters: source.length,
      lines: source.split("\n").length,
      minutes: Math.max(1, Math.ceil(words / 220)),
    };
  }, [source]);

  function download() {
    const blob = new Blob([source], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div className="toggle-group" role="group" aria-label="Layout">
          <button type="button" aria-pressed={!split} onClick={() => setSplit(false)}>
            Write
          </button>
          <button type="button" aria-pressed={split} onClick={() => setSplit(true)}>
            Split
          </button>
        </div>
        <span className="micro" aria-live="polite">
          {stats.words.toLocaleString("en-US")} words · {stats.characters.toLocaleString("en-US")} chars · {stats.lines} lines · ~{stats.minutes} min read
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: split ? "repeat(2, minmax(0, 1fr))" : "1fr", gap: 18 }}>
        <div className="field">
          <label htmlFor="md-source">Markdown</label>
          <textarea
            id="md-source"
            className="textarea"
            style={{ minHeight: 380 }}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>
        <div>
          <span className="field-label">Preview</span>
          <div
            className="prose markdown-preview"
            style={{
              border: "1px solid var(--wt-color-line)",
              borderRadius: "var(--nexus-radius-md)",
              padding: 16,
              minHeight: 380,
              maxHeight: 520,
              overflow: "auto",
              marginTop: 6,
              background: "var(--wt-color-surface)",
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton value={source} label="Copy Markdown" />
        <CopyButton value={html} label="Copy HTML" />
        <button type="button" className="btn btn-sm" onClick={download}>
          Download .md
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setSource("")}>
          Clear
        </button>
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        GitHub-flavoured Markdown via marked. Raw HTML is allowed by the spec, so the preview strips scripts, event
        handlers and <code>javascript:</code> links before rendering.
      </p>
    </div>
  );
}
