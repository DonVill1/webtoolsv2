"use client";

import { useState } from "react";
import { useToolView } from "./useToolView";

type Ecc = "L" | "M" | "Q" | "H";
type QrType = "url" | "text" | "wifi" | "vcard";

const templates: Record<QrType, string> = {
  url: "https://example.com",
  text: "Hello from WebTools — scan to read this note.",
  wifi: "WIFI:T:WPA;S:MyNetwork;P:change-me;;",
  vcard:
    "BEGIN:VCARD\nVERSION:3.0\nFN:Ada Lovelace\nORG:Analytical Engines\nTEL:+15550100\nEMAIL:ada@example.com\nEND:VCARD",
};

const hints: Record<QrType, string> = {
  url: "A link opens directly. Keep it short so the code stays easy to scan.",
  text: "Plain text is stored in the code itself; nothing is fetched when it is scanned.",
  wifi: "Format: WIFI:T:WPA;S:network;P:password;; — use T:nopass for an open network and H:true for a hidden one.",
  vcard: "vCard 3.0 text adds a contact when scanned. Replace the sample name, phone and email.",
};

export default function QrCodeGenerator() {
  const { view } = useToolView("qr-code-generator");
  const type: QrType = view === "text" || view === "wifi" || view === "vcard" ? view : "url";
  // Each content type keeps its own draft, so switching tabs never throws away
  // something the reader typed.
  const [drafts, setDrafts] = useState<Record<QrType, string>>(templates);
  const text = drafts[type];
  const setText = (value: string) => setDrafts((current) => ({ ...current, [type]: value }));
  const [size, setSize] = useState(320);
  const [ecc, setEcc] = useState<Ecc>("M");
  const [dark, setDark] = useState("#111111");
  const [light, setLight] = useState("#ffffff");
  // Keyed to the exact inputs, so switching tabs or changing a setting hides
  // the previous code instead of showing one that no longer matches the form.
  const [result, setResult] = useState<{ key: string; image: string; svg: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const key = JSON.stringify({ text: text.trim(), size, ecc, dark, light });
  const current = result?.key === key ? result : null;
  const image = current?.image ?? "";
  const svg = current?.svg ?? "";

  async function generate() {
    if (!text.trim()) {
      setError("Enter text or a URL first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { default: QRCode } = await import("qrcode");
      const [url, vector] = await Promise.all([
        QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          errorCorrectionLevel: ecc,
          color: { dark, light },
        }),
        QRCode.toString(text, {
          type: "svg",
          margin: 2,
          errorCorrectionLevel: ecc,
          color: { dark, light },
        }),
      ]);
      setResult({ key, image: url, svg: vector });
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Could not generate the code. The content may be too long.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = "qr-code.png";
    link.click();
  }

  function downloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-panel">
      <div className="grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label htmlFor="qr-text">Content — {type === "url" ? "URL" : type === "vcard" ? "vCard" : type === "wifi" ? "Wi-Fi network" : "text"}</label>
            <textarea
              id="qr-text"
              className="textarea"
              style={{ minHeight: 110 }}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={templates[type]}
              spellCheck={type !== "wifi"}
            />
            <p className="micro" style={{ marginTop: 6 }}>{hints[type]}</p>
          </div>

          <div className="row-wrap">
            <div className="field grow">
              <label htmlFor="qr-size">Size — {size} px</label>
              <input
                id="qr-size"
                type="range"
                min="128"
                max="1024"
                step="32"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                style={{ width: "100%", accentColor: "var(--wt-color-accent)" }}
              />
            </div>
            <div className="field" style={{ width: 120 }}>
              <label htmlFor="qr-ecc">Correction</label>
              <select id="qr-ecc" className="select" value={ecc} onChange={(event) => setEcc(event.target.value as Ecc)}>
                <option value="L">L — 7%</option>
                <option value="M">M — 15%</option>
                <option value="Q">Q — 25%</option>
                <option value="H">H — 30%</option>
              </select>
            </div>
          </div>

          <div className="row-wrap">
            <div className="field grow">
              <label htmlFor="qr-dark">Foreground</label>
              <input id="qr-dark" type="color" value={dark} onChange={(event) => setDark(event.target.value)} style={{ height: 40, width: "100%" }} />
            </div>
            <div className="field grow">
              <label htmlFor="qr-light">Background</label>
              <input id="qr-light" type="color" value={light} onChange={(event) => setLight(event.target.value)} style={{ height: 40, width: "100%" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>
              {busy ? "Generating…" : "Generate QR code"}
            </button>
            <button type="button" className="btn" onClick={download} disabled={!image}>
              Download PNG
            </button>
            <button type="button" className="btn" onClick={downloadSvg} disabled={!svg}>
              Download SVG
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center",
            border: "1px solid var(--wt-color-line)",
            borderRadius: "var(--nexus-radius-md)",
            background: "var(--wt-color-surface-sunken)",
            minHeight: 280,
            padding: 16,
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Generated QR code" style={{ width: "100%", maxWidth: size, imageRendering: "pixelated" }} />
          ) : (
            <p className="micro" style={{ textAlign: "center" }}>
              Your code renders here.
              <br />
              Nothing leaves the browser.
            </p>
          )}
        </div>
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Higher correction survives more damage but stores less data. Test the code with a phone before printing it at
        scale; contrast below 4:1 often fails in dim light.
      </p>
    </div>
  );
}
