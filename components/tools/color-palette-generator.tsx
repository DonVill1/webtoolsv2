"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9a-f]{6}$/i.test(value)) return `#${value.toLowerCase()}`;
  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const part = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

function hexToHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex).map((value) => value / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex({ h, s, l }: Hsl): string {
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [chroma, x, 0]
      : hp < 2
        ? [x, chroma, 0]
        : hp < 3
          ? [0, chroma, x]
          : hp < 4
            ? [0, x, chroma]
            : hp < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const m = lightness - chroma / 2;
  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

interface Group {
  label: string;
  note: string;
  colors: string[];
}

export default function ColorPaletteGenerator() {
  const [hex, setHex] = useState("#2f5d50");

  const base = normalizeHex(hex) ?? "#2f5d50";
  const hsl = useMemo(() => hexToHsl(base), [base]);

  const groups = useMemo<Group[]>(() => {
    const at = (h: number, s = hsl.s, l = hsl.l) => hslToHex({ h, s, l });
    return [
      { label: "Complementary", note: "+180°", colors: [base, at(hsl.h + 180)] },
      { label: "Analogous", note: "±30°", colors: [at(hsl.h - 30), base, at(hsl.h + 30)] },
      { label: "Triadic", note: "±120°", colors: [base, at(hsl.h + 120), at(hsl.h + 240)] },
      { label: "Split complement", note: "+150° / +210°", colors: [base, at(hsl.h + 150), at(hsl.h + 210)] },
      {
        label: "Tints",
        note: "lighter steps",
        colors: [at(hsl.h, hsl.s, 92), at(hsl.h, hsl.s, 78), at(hsl.h, hsl.s, 64), base],
      },
      {
        label: "Shades",
        note: "darker steps",
        colors: [base, at(hsl.h, hsl.s, Math.max(8, hsl.l - 12)), at(hsl.h, hsl.s, Math.max(6, hsl.l - 24)), at(hsl.h, hsl.s, Math.max(4, hsl.l - 36))],
      },
    ];
  }, [base, hsl]);

  const cssVariables = useMemo(() => {
    const lines = [":root {"];
    lines.push(`  --palette-base: ${base};`);
    for (const group of groups) {
      const key = group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      group.colors.forEach((color, index) => lines.push(`  --palette-${key}-${index + 1}: ${color};`));
    }
    lines.push("}");
    return lines.join("\n");
  }, [base, groups]);

  const onWhite = contrast(base, "#ffffff");
  const onBlack = contrast(base, "#000000");
  const bestText = onWhite > onBlack ? "#ffffff" : "#000000";
  const bestContrast = Math.max(onWhite, onBlack);

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ alignItems: "end" }}>
        <div className="field" style={{ width: 120 }}>
          <label htmlFor="color-picker">Colour</label>
          <input
            id="color-picker"
            type="color"
            value={base}
            onChange={(event) => setHex(event.target.value)}
            style={{ height: 44, width: "100%", padding: 4 }}
          />
        </div>
        <div className="field grow">
          <label htmlFor="color-hex">Hex</label>
          <input
            id="color-hex"
            className="input"
            value={hex}
            onChange={(event) => setHex(event.target.value)}
            onBlur={() => setHex(base)}
            spellCheck={false}
            maxLength={7}
          />
        </div>
        <div className="field" style={{ minWidth: 150 }}>
          <span className="field-label">HSL</span>
          <div className="input" style={{ display: "flex", alignItems: "center" }}>
            {hsl.h}° {hsl.s}% {hsl.l}%
          </div>
        </div>
        <CopyButton value={base} label="Copy hex" />
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
        {groups.map((group) => (
          <section key={group.label}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
              <span className="field-label">{group.label}</span>
              <span className="micro">{group.note}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${group.colors.length}, minmax(0, 1fr))`, gap: 1, border: "1px solid var(--wt-color-line)" }}>
              {group.colors.map((color, index) => (
                <button
                  key={`${group.label}-${index}`}
                  type="button"
                  onClick={() => setHex(color)}
                  title={`Use ${color}`}
                  style={{
                    background: color,
                    border: 0,
                    minHeight: 74,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: 8,
                    cursor: "pointer",
                    color: contrast(color, "#ffffff") > 3.5 ? "#ffffff" : "#111111",
                    fontFamily: "var(--font-plex), monospace",
                    fontSize: 11,
                  }}
                >
                  <span>{color}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <dl className="kv" style={{ marginTop: 22 }}>
        <dt>Contrast on white</dt>
        <dd>
          {onWhite.toFixed(2)}:1 {onWhite >= 4.5 ? "· AA text" : onWhite >= 3 ? "· large text only" : "· fails text contrast"}
        </dd>
        <dt>Contrast on black</dt>
        <dd>
          {onBlack.toFixed(2)}:1 {onBlack >= 4.5 ? "· AA text" : onBlack >= 3 ? "· large text only" : "· fails text contrast"}
        </dd>
        <dt>Suggested text colour</dt>
        <dd>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, background: bestText, border: "1px solid var(--wt-color-line)" }} />
            {bestText} · {bestContrast.toFixed(2)}:1
          </span>
        </dd>
      </dl>

      <div style={{ marginTop: 14 }}>
        <CopyButton value={cssVariables} label="Copy CSS variables" />
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Harmonies use HSL rotation, which keeps saturation and lightness readable but is not perceptually uniform.
        Contrast ratios follow WCAG 2.1 relative luminance.
      </p>
    </div>
  );
}
