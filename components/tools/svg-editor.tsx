"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

const sample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <rect width="120" height="120" fill="#f4f1e9"/>
  <circle cx="60" cy="52" r="28" fill="#2f5d50"/>
  <path d="M24 108c4-20 18-30 36-30s32 10 36 30" fill="none" stroke="#b4543f" stroke-width="6"/>
</svg>`;

export default function SvgEditor() {
  const [source, setSource] = useState(sample);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const parsed = useMemo(() => {
    if (!mounted) return { ok: false as const, error: "Preview loads in the browser." };
    try {
      const document = new DOMParser().parseFromString(source, "image/svg+xml");
      const failure = document.querySelector("parsererror");
      if (failure) return { ok: false as const, error: "Malformed XML — check unclosed tags and attribute quotes." };
      if (document.documentElement.tagName.toLowerCase() !== "svg") {
        return { ok: false as const, error: "The root element must be <svg>." };
      }
      const paths = document.querySelectorAll("path, rect, circle, ellipse, line, polyline, polygon").length;
      const text = document.querySelectorAll("text").length;
      const width = document.documentElement.getAttribute("width") ?? document.documentElement.getAttribute("viewBox")?.split(/\s+/)[2] ?? "—";
      const height = document.documentElement.getAttribute("height") ?? document.documentElement.getAttribute("viewBox")?.split(/\s+/)[3] ?? "—";
      return {
        ok: true as const,
        dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`,
        size: new Blob([source]).size,
        shapes: paths,
        texts: text,
        width,
        height,
      };
    } catch {
      return { ok: false as const, error: "Could not parse this SVG." };
    }
  }, [source, mounted]);

  const minified = useMemo(
    () =>
      source
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim(),
    [source],
  );

  function download() {
    if (!parsed.ok) return;
    const blob = new Blob([minified], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "drawing.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-panel">
      <div className="grid-2">
        <div className="field">
          <label htmlFor="svg-source">SVG source</label>
          <textarea
            id="svg-source"
            className="textarea"
            style={{ minHeight: 300 }}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>
        <div>
          <span className="field-label">Preview</span>
          <div
            style={{
              marginTop: 6,
              border: "1px solid var(--wt-color-line)",
              background: "repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 16px 16px",
              minHeight: 300,
              display: "grid",
              placeItems: "center",
              padding: 12,
            }}
          >
            {parsed.ok ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={parsed.dataUrl} alt="SVG preview" style={{ maxWidth: "100%", maxHeight: 420 }} />
            ) : (
              <p className="error-text" style={{ padding: 12 }}>{parsed.error}</p>
            )}
          </div>
        </div>
      </div>

      {parsed.ok ? (
        <dl className="kv" style={{ marginTop: 16 }}>
          <dt>Canvas</dt>
          <dd>{parsed.width} × {parsed.height}</dd>
          <dt>Shapes</dt>
          <dd>{parsed.shapes} elements · {parsed.texts} text</dd>
          <dt>Source size</dt>
          <dd>{(parsed.size / 1024).toFixed(1)} KiB · {(new Blob([minified]).size / 1024).toFixed(1)} KiB minified</dd>
        </dl>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton value={minified} label="Copy minified SVG" />
        <CopyButton value={parsed.ok ? parsed.dataUrl : ""} label="Copy data URL" />
        <button type="button" className="btn btn-sm" onClick={download} disabled={!parsed.ok}>
          Download .svg
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setSource(sample)}>
          Reset sample
        </button>
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        The preview renders through an <code>&lt;img&gt;</code> element, so scripts inside the file cannot run. That
        also means inline CSS animations and fonts behave as they would in an image, not on your page.
      </p>
    </div>
  );
}
