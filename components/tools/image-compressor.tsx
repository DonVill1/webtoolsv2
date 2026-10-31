"use client";

import { useEffect, useState } from "react";
import { formatBytes } from "@/lib/format";

type Format = "image/jpeg" | "image/webp";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [output, setOutput] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [dimensions, setDimensions] = useState<{ width: number; height: number; outWidth: number; outHeight: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setSourceUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function compress(selected: File, settings: { quality: number; maxWidth: number; format: Format }) {
    setBusy(true);
    setError("");
    try {
      const bitmap = await createImageBitmap(selected);
      const originalWidth = bitmap.width;
      const originalHeight = bitmap.height;
      const scale = Math.min(1, settings.maxWidth / originalWidth);
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("The canvas context is unavailable in this browser.");
      if (settings.format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      const dataUrl = canvas.toDataURL(settings.format, settings.quality);
      setOutput(dataUrl);
      setOutputSize(Math.round(((dataUrl.length - "data:,".length) * 3) / 4));
      setDimensions({ width: originalWidth, height: originalHeight, outWidth: width, outHeight: height });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read this image.");
      setOutput("");
    } finally {
      setBusy(false);
    }
  }

  function apply(overrides: Partial<{ quality: number; maxWidth: number; format: Format }> = {}) {
    if (!file) return;
    void compress(file, { quality, maxWidth, format, ...overrides });
  }

  function download() {
    if (!output) return;
    const link = document.createElement("a");
    link.href = output;
    link.download = `compressed.${format === "image/webp" ? "webp" : "jpg"}`;
    link.click();
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="img-file">Image — PNG, JPEG, WebP or AVIF</label>
          <input
            id="img-file"
            type="file"
            accept="image/*"
            className="input"
            style={{ paddingTop: 10 }}
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              setOutput("");
              setError("");
              if (selected) void compress(selected, { quality, maxWidth, format });
            }}
          />
        </div>
        <div className="field" style={{ width: 150 }}>
          <label htmlFor="img-format">Output format</label>
          <select
            id="img-format"
            className="select"
            value={format}
            onChange={(event) => {
              const next = event.target.value as Format;
              const nextQuality = next === "image/webp" ? 0.85 : 0.8;
              setFormat(next);
              setQuality(nextQuality);
              apply({ format: next, quality: nextQuality });
            }}
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
      </div>

      <div className="row-wrap" style={{ marginTop: 12 }}>
        <div className="field grow">
          <label htmlFor="img-quality">Quality — {Math.round(quality * 100)}%</label>
          <input
            id="img-quality"
            type="range"
            min="0.3"
            max="0.95"
            step="0.05"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            style={{ width: "100%", accentColor: "var(--wt-color-accent)" }}
          />
        </div>
        <div className="field grow">
          <label htmlFor="img-width">Max width — {maxWidth}px</label>
          <input
            id="img-width"
            type="range"
            min="320"
            max="4000"
            step="80"
            value={maxWidth}
            onChange={(event) => setMaxWidth(Number(event.target.value))}
            style={{ width: "100%", accentColor: "var(--wt-color-accent)" }}
          />
        </div>
        <button type="button" className="btn" style={{ height: 44 }} disabled={!file || busy} onClick={() => apply()}>
          {busy ? "Working…" : "Apply settings"}
        </button>
      </div>

      {error ? <p className="error-text" style={{ marginTop: 12 }}>{error}</p> : null}

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div>
          <span className="field-label">Original</span>
          <div style={{ border: "1px solid var(--wt-color-line)", marginTop: 6, background: "var(--wt-color-surface-sunken)", display: "grid", placeItems: "center", minHeight: 200, padding: 8 }}>
            {sourceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sourceUrl} alt="Original" style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain" }} />
            ) : (
              <p className="micro">Choose an image to compare.</p>
            )}
          </div>
          {file ? (
            <dl className="kv" style={{ marginTop: 10 }}>
              <dt>Size</dt>
              <dd>{formatBytes(file.size)}</dd>
              <dt>Type</dt>
              <dd>{file.type || "unknown"}</dd>
              {dimensions ? (
                <>
                  <dt>Dimensions</dt>
                  <dd>{dimensions.width} × {dimensions.height}</dd>
                </>
              ) : null}
            </dl>
          ) : null}
        </div>

        <div>
          <span className="field-label">Compressed</span>
          <div style={{ border: "1px solid var(--wt-color-line)", marginTop: 6, background: "var(--wt-color-surface-sunken)", display: "grid", placeItems: "center", minHeight: 200, padding: 8 }}>
            {output ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={output} alt="Compressed" style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain" }} />
            ) : (
              <p className="micro">{busy ? "Compressing…" : "The result appears here."}</p>
            )}
          </div>
          {output && file ? (
            <dl className="kv" style={{ marginTop: 10 }}>
              <dt>Size</dt>
              <dd>
                {formatBytes(outputSize)}{" "}
                <span className={outputSize < file.size ? "ok-text" : "warning-text"}>
                  ({outputSize < file.size ? "−" : "+"}
                  {Math.abs(Math.round((1 - outputSize / file.size) * 100))}%)
                </span>
              </dd>
              <dt>Dimensions</dt>
              <dd>{dimensions ? `${dimensions.outWidth} × ${dimensions.outHeight}` : "—"}</dd>
              <dt>Quality</dt>
              <dd>{Math.round(quality * 100)}% {format === "image/webp" ? "WebP" : "JPEG"}</dd>
            </dl>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" onClick={download} disabled={!output}>
          Download compressed image
        </button>
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Re-encoding is lossy: quality below 70% shows artifacts, especially on text and gradients. JPEG has no
        transparency, so transparent pixels are flattened onto white. Your image never leaves the browser.
      </p>
    </div>
  );
}
