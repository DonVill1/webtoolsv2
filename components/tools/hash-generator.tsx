"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { useToolView } from "./useToolView";

type Algorithm = "SHA-256" | "SHA-384" | "SHA-512" | "SHA-1";
type Encoder = "hex" | "base64";
type Source = "text" | "file";

const algorithmForView: Record<string, Algorithm> = {
  sha256: "SHA-256",
  sha512: "SHA-512",
  sha384: "SHA-384",
  sha1: "SHA-1",
};

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]!);
  return btoa(binary);
}

interface HashResult {
  algorithm: Algorithm;
  encoding: Encoder;
  value: string;
  label: string;
  bytes: number;
}

export default function HashGenerator() {
  const { view } = useToolView("hash-generator");
  const algorithm = algorithmForView[view] ?? "SHA-256";
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<Source>("text");
  const [encoding, setEncoding] = useState<Encoder>("hex");
  const [expected, setExpected] = useState("");
  const [result, setResult] = useState<HashResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function compute() {
    if (source === "text" && !text) return;
    if (source === "file" && !file) return;
    setBusy(true);
    setMessage(null);
    try {
      const data =
        source === "file" && file
          ? await file.arrayBuffer()
          : new TextEncoder().encode(text).buffer;
      const digest = await crypto.subtle.digest(algorithm, data);
      setResult({
        algorithm,
        encoding,
        value: encoding === "hex" ? toHex(digest) : toBase64(digest),
        label: source === "file" && file ? file.name : "Pasted text",
        bytes: data.byteLength,
      });
    } catch {
      setMessage("The browser could not hash that input. A very large file may exhaust memory; try one under 100 MB.");
    } finally {
      setBusy(false);
    }
  }

  // A digest computed with another algorithm or encoding is stale, not wrong;
  // hide it until the reader hashes again.
  const shown = result && result.algorithm === algorithm && result.encoding === encoding ? result : null;

  const normalized = (value: string) =>
    encoding === "hex" ? value.trim().toLowerCase().replace(/\s+/g, "") : value.trim();
  const matches = expected.trim() !== "" && shown !== null && normalized(expected) === normalized(shown.value);

  const byteCount = source === "file" ? (file?.size ?? 0) : new TextEncoder().encode(text).length;

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ marginBottom: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={source === "text" ? "btn btn-sm btn-primary" : "btn btn-sm"}
            onClick={() => setSource("text")}
          >
            Text
          </button>
          <button
            type="button"
            className={source === "file" ? "btn btn-sm btn-primary" : "btn btn-sm"}
            onClick={() => setSource("file")}
          >
            File
          </button>
        </div>
        <div className="field" style={{ width: 140 }}>
          <label htmlFor="hash-encoding">Output</label>
          <select
            id="hash-encoding"
            className="select"
            value={encoding}
            onChange={(event) => setEncoding(event.target.value as Encoder)}
          >
            <option value="hex">Hexadecimal</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>

      {source === "text" ? (
        <>
          <label className="field-label" htmlFor="hash-input">
            Text to hash
          </label>
          <textarea
            id="hash-input"
            className="textarea"
            style={{ minHeight: 120, marginTop: 6 }}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setResult(null);
            }}
            placeholder="Type or paste text…"
          />
        </>
      ) : (
        <div className="field">
          <label htmlFor="hash-file">File to hash</label>
          <input
            id="hash-file"
            className="input"
            type="file"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
            }}
            style={{ paddingTop: 10 }}
          />
          <p className="micro" style={{ marginTop: 6 }}>
            {file
              ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB · read in this tab only`
              : "Choose any file. Nothing is uploaded; the digest is computed with Web Crypto."}
            {file && file.size > 100 * 1024 * 1024 ? " Files over 100 MB may exhaust browser memory." : ""}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={compute}
          disabled={(source === "text" ? !text : !file) || busy}
        >
          {busy ? "Hashing…" : source === "file" ? `Hash file with ${algorithm}` : `Hash with ${algorithm}`}
        </button>
        <CopyButton value={shown?.value ?? ""} label="Copy hash" />
      </div>

      {message ? <p className="error-text">{message}</p> : null}

      <div className="output" style={{ marginTop: 14, minHeight: 56 }} aria-live="polite">
        {shown ? (
          <>
            <div className="micro" style={{ marginBottom: 6 }}>
              {shown.label} · {shown.bytes.toLocaleString("en-US")} bytes · {algorithm}
            </div>
            {shown.value}
          </>
        ) : (
          <span className="micro">
            The digest appears here. Hashing runs in your browser via Web Crypto; no file or text is uploaded.
          </span>
        )}
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="hash-expected">Compare with a known hash (optional)</label>
        <input
          id="hash-expected"
          className="input"
          value={expected}
          onChange={(event) => setExpected(event.target.value)}
          placeholder="Paste the expected digest"
          spellCheck={false}
        />
        {expected.trim() ? (
          <p className={matches ? "ok-text" : "error-text"} style={{ marginTop: 4 }} aria-live="polite">
            {matches ? "Match — the digests are identical." : "No match (or no computed hash yet)."}
          </p>
        ) : null}
      </div>

      <dl className="kv" style={{ marginTop: 18 }}>
        <dt>Input size</dt>
        <dd>{byteCount.toLocaleString("en-US")} bytes</dd>
        <dt>Digest length</dt>
        <dd>{algorithm === "SHA-1" ? 20 : algorithm === "SHA-256" ? 32 : algorithm === "SHA-384" ? 48 : 64} bytes</dd>
        <dt>Safety</dt>
        <dd>SHA-1 is broken for collision resistance; use SHA-256 or stronger for integrity.</dd>
      </dl>
    </div>
  );
}
