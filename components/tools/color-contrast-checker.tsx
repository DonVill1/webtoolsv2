"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { contrastVerdicts, parseColor, relativeLuminance, suggestPassing, toHex } from "@/lib/tools/color";

function Verdict({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="kv-row" style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0" }}>
      <span>{label}</span>
      <span className={pass ? "ok-text" : "error-text"}>{pass ? "Pass" : "Fail"}</span>
    </div>
  );
}

export default function ColorContrastChecker() {
  const [text, setText] = useState("#2DD4BF");
  const [background, setBackground] = useState("#FFFFFF");

  const textRgb = parseColor(text);
  const backgroundRgb = parseColor(background);
  const verdicts = useMemo(
    () => (textRgb && backgroundRgb ? contrastVerdicts(textRgb, backgroundRgb) : null),
    [textRgb, backgroundRgb],
  );
  const suggestion = useMemo(
    () => (textRgb && backgroundRgb ? suggestPassing(textRgb, backgroundRgb) : null),
    [textRgb, backgroundRgb],
  );

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        {[
          { id: "contrast-text", label: "Text colour", value: text, set: setText },
          { id: "contrast-bg", label: "Background", value: background, set: setBackground },
        ].map((field) => (
          <div className="field grow" key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id={field.id}
                type="color"
                value={parseColor(field.value) ? toHex(parseColor(field.value)!) : "#000000"}
                onChange={(event) => field.set(event.target.value.toUpperCase())}
                style={{ width: 48, height: 44, padding: 2, border: "1px solid var(--wt-color-line)", background: "var(--wt-color-surface)" }}
              />
              <input
                className="input mono grow"
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
                spellCheck={false}
                aria-label={`${field.label} hex value`}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="readout"
        style={{
          background: backgroundRgb ? toHex(backgroundRgb) : undefined,
          color: textRgb ? toHex(textRgb) : undefined,
          marginTop: 16,
        }}
        aria-live="polite"
      >
        <div>
          <span style={{ fontSize: "calc(var(--nexus-type-xl) * 0.7)", fontWeight: 600 }}>Large preview 24px</span>
          <div style={{ marginTop: 6, fontSize: "var(--nexus-type-md)" }}>
            Body copy at 16px: the quick brown fox jumps over the lazy dog.
          </div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
            Small print at 13px, to show where a marginal ratio starts to hurt.
          </div>
        </div>
        <div className="readout-formula" style={{ borderColor: "currentColor" }}>
          {verdicts ? `${verdicts.ratio.toFixed(2)}:1` : "—"}
          <br />
          {verdicts ? (verdicts.aaNormal ? "AA normal text" : "below AA normal") : "enter two colours"}
        </div>
      </div>

      {!textRgb || !backgroundRgb ? (
        <p className="error-text" style={{ marginTop: 10 }}>
          Use a hex value such as #1F2937 or an rgb() value. Named colours are not parsed here.
        </p>
      ) : null}

      {verdicts ? (
        <>
          <div className="grid-2" style={{ marginTop: 18 }}>
            <section>
              <span className="field-label">WCAG 2.2 verdicts</span>
              <Verdict label="AA · normal text (4.5:1)" pass={verdicts.aaNormal} />
              <Verdict label="AA · large text (3:1)" pass={verdicts.aaLarge} />
              <Verdict label="AAA · normal text (7:1)" pass={verdicts.aaaNormal} />
              <Verdict label="AAA · large text (4.5:1)" pass={verdicts.aaaLarge} />
            </section>
            <section>
              <span className="field-label">Suggested text colour</span>
              {suggestion ? (
                <>
                  <div
                    style={{
                      marginTop: 8,
                      height: 64,
                      border: "1px solid var(--wt-color-line)",
                      background: toHex(backgroundRgb!),
                      color: toHex(suggestion),
                      display: "grid",
                      placeItems: "center",
                      fontSize: 20,
                      fontWeight: 600,
                    }}
                  >
                    {toHex(suggestion).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-sm" onClick={() => setText(toHex(suggestion).toUpperCase())}>
                      Use suggestion
                    </button>
                    <CopyButton value={toHex(suggestion).toUpperCase()} label="Copy" />
                  </div>
                  <p className="micro" style={{ marginTop: 6 }}>
                    Nearest passing colour at AA normal text, made by blending toward {verdicts.ratio < 4.5 ? "black or white" : "the safer extreme"}.
                  </p>
                </>
              ) : (
                <p className="micro">No passing blend found for this pair.</p>
              )}
            </section>
          </div>

          <dl className="kv" style={{ marginTop: 18 }}>
            <dt>Text luminance</dt>
            <dd className="mono">{relativeLuminance(textRgb!).toFixed(4)}</dd>
            <dt>Background luminance</dt>
            <dd className="mono">{relativeLuminance(backgroundRgb!).toFixed(4)}</dd>
            <dt>Ratio</dt>
            <dd className="mono">{verdicts.ratio.toFixed(2)}:1</dd>
          </dl>
        </>
      ) : null}

      <p className="micro" style={{ marginTop: 14 }}>
        The ratio is (lighter luminance + 0.05) ÷ (darker luminance + 0.05). It measures colour contrast, not
        readability: size, weight, spacing and colour-vision differences still matter.
      </p>
    </div>
  );
}
