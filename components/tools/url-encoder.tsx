"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { decodeUrl, encodeUrl, parseUrl, type UrlMode } from "@/lib/tools/url-encode";

export default function UrlEncoder() {
  const [input, setInput] = useState("hello world & goodbye");
  const [mode, setMode] = useState<UrlMode>("component");
  const [decoding, setDecoding] = useState(false);

  const encoded = useMemo(() => {
    if (decoding) {
      const decoded = decodeUrl(input);
      return decoded.error ? "" : decoded.value;
    }
    try {
      return encodeUrl(input, mode);
    } catch {
      return "";
    }
  }, [input, mode, decoding]);

  const decodeError = decoding ? decodeUrl(input).error : null;
  const { parsed } = useMemo(() => parseUrl(decoding ? encoded : input), [decoding, encoded, input]);

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field" style={{ width: 180 }}>
          <label htmlFor="url-mode">Encoding mode</label>
          <select
            id="url-mode"
            className="select"
            value={mode}
            onChange={(event) => setMode(event.target.value as UrlMode)}
            disabled={decoding}
          >
            <option value="component">One component</option>
            <option value="whole">Whole URL</option>
          </select>
        </div>
        <div className="field grow">
          <span className="field-label">Direction</span>
          <div style={{ display: "flex", gap: 8, minHeight: 44, alignItems: "center" }}>
            <button
              type="button"
              className={decoding ? "btn btn-sm" : "btn btn-sm btn-primary"}
              onClick={() => setDecoding(false)}
            >
              Encode
            </button>
            <button
              type="button"
              className={decoding ? "btn btn-sm btn-primary" : "btn btn-sm"}
              onClick={() => setDecoding(true)}
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      <label className="field-label" htmlFor="url-input" style={{ display: "block", marginTop: 12 }}>
        {decoding ? "Encoded value" : mode === "whole" ? "Full URL" : "Text to encode"}
      </label>
      <textarea
        id="url-input"
        className="textarea"
        style={{ minHeight: 100, marginTop: 6 }}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        spellCheck={false}
      />

      {decodeError ? <p className="error-text">{decodeError}</p> : null}

      <div className="row-wrap" style={{ justifyContent: "space-between", marginTop: 14 }}>
        <span className="field-label">{decoding ? "Decoded" : "Encoded"}</span>
        <CopyButton value={encoded} label="Copy" />
      </div>
      <pre className="output" style={{ minHeight: 56 }}>
        {encoded || "—"}
      </pre>

      {parsed ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          <dt>Scheme</dt>
          <dd>{parsed.scheme || "—"}</dd>
          <dt>Host</dt>
          <dd>{parsed.host || "—"}</dd>
          <dt>Path</dt>
          <dd>{parsed.path || "/"}</dd>
          <dt>Query</dt>
          <dd>{parsed.query || "—"}</dd>
          <dt>Fragment</dt>
          <dd>{parsed.fragment || "—"}</dd>
          {parsed.params.length > 0 ? (
            <>
              <dt>Parameters</dt>
              <dd>
                {parsed.params.map((param) => `${param.key} = ${param.value}`).join(" · ")}
              </dd>
            </>
          ) : null}
        </dl>
      ) : null}

      <p className="micro" style={{ marginTop: 14 }}>
        Encoding runs in the browser. Component mode uses encodeURIComponent; whole-URL mode uses encodeURI so the
        separators survive. Decoding replaces + with a space, as form-encoded data does.
      </p>
    </div>
  );
}
