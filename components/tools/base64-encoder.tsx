"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatBytes } from "@/lib/format";
import { useToolView } from "./useToolView";

type Mode = "encode" | "decode";

const CHUNK = 0x8000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(index, index + CHUNK));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replace(/[-_]/g, (char) => (char === "-" ? "+" : "/")).replace(/\s+/g, "");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function toUrlSafe(value: string): string {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export default function Base64Encoder() {
  const { view, select } = useToolView("base64-encoder");
  const mode: Mode = view === "decode" ? "decode" : "encode";
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [fileName, setFileName] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return { text: "", error: "", bytes: 0 };
    try {
      if (mode === "encode") {
        const bytes = new TextEncoder().encode(input);
        const encoded = bytesToBase64(bytes);
        return { text: urlSafe ? toUrlSafe(encoded) : encoded, error: "", bytes: bytes.length };
      }
      const bytes = base64ToBytes(input);
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return { text, error: "", bytes: bytes.length };
    } catch {
      return {
        text: "",
        error:
          mode === "encode"
            ? "Could not encode this text."
            : "Not valid base64, or the decoded bytes are not UTF-8 text. Binary payloads cannot be shown as text.",
        bytes: 0,
      };
    }
  }, [input, mode, urlSafe]);

  async function readFile(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      setInput("File too large — this tool caps uploads at 4 MiB to keep the page responsive.");
      return;
    }
    const buffer = await file.arrayBuffer();
    const encoded = bytesToBase64(new Uint8Array(buffer));
    setFileName(file.name);
    select("encode");
    setInput(encoded);
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(event) => setUrlSafe(event.target.checked)}
            disabled={mode === "decode"}
          />
          URL-safe alphabet
        </label>
      </div>

      <div className="field">
        <label htmlFor="b64-input">{mode === "encode" ? "Text to encode" : "Base64 to decode"}</label>
        <textarea
          id="b64-input"
          className="textarea"
          style={{ minHeight: 150 }}
          spellCheck={false}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setFileName("");
          }}
          placeholder={mode === "encode" ? "Any UTF-8 text…" : "SGVsbG8sIHdvcmxkIQ=="}
        />
      </div>

      {mode === "encode" ? (
        <div style={{ marginTop: 10 }}>
          <label className="btn btn-sm" style={{ cursor: "pointer" }}>
            Load a file (≤ 4 MiB)
            <input
              type="file"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void readFile(file);
              }}
            />
          </label>
          {fileName ? <span className="micro" style={{ marginLeft: 10 }}>{fileName}</span> : null}
        </div>
      ) : null}

      <div className="readout" style={{ marginTop: 16 }}>
        <div>
          <span className="readout-value" style={{ fontSize: "calc(var(--nexus-type-xl) * 0.62)" }}>
            {result.error ? "—" : `${result.text.length.toLocaleString("en-US")} chars`}
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {result.error ? "Conversion failed" : `Output · ${formatBytes(result.bytes)} decoded`}
          </div>
        </div>
        <CopyButton value={result.text} label="Copy output" />
      </div>

      {result.error ? (
        <p className="error-text" style={{ marginTop: 10 }}>{result.error}</p>
      ) : (
        <pre className="output" style={{ marginTop: 12, minHeight: 90 }}>
          {result.text || (mode === "encode" ? "Your base64 appears here." : "Your decoded text appears here.")}
        </pre>
      )}

      <p className="micro" style={{ marginTop: 14 }}>
        Base64 is an encoding, not encryption: anyone with the string can read it. URL-safe mode swaps{" "}
        <code>+</code> and <code>/</code> for <code>-</code> and <code>_</code> and strips padding.
      </p>
    </div>
  );
}
