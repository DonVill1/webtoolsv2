"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
} as const;

const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "|", "`", "'", '"']);

function randomIndex(max: number): number {
  const limit = 256 - (256 % max);
  const buffer = new Uint8Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0]! < limit) return buffer[0]! % max;
  }
}

function shuffle(values: string[]): string[] {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1);
    [values[index], values[swap]] = [values[swap]!, values[index]!];
  }
  return values;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [password, setPassword] = useState("");

  const selected = useMemo(() => {
    const pools: string[] = [];
    if (lower) pools.push(SETS.lower);
    if (upper) pools.push(SETS.upper);
    if (numbers) pools.push(SETS.numbers);
    if (symbols) pools.push(SETS.symbols);
    return pools;
  }, [lower, upper, numbers, symbols]);

  const pool = useMemo(() => {
    let combined = selected.join("");
    if (noAmbiguous) combined = Array.from(combined).filter((char) => !AMBIGUOUS.has(char)).join("");
    return combined;
  }, [selected, noAmbiguous]);

  const entropy = useMemo(() => {
    if (!pool) return 0;
    return Math.round(length * Math.log2(pool.length));
  }, [length, pool]);

  const generate = useCallback(() => {
    if (!pool) {
      setPassword("");
      return;
    }
    const chars: string[] = [];
    for (const set of selected) {
      const filtered = noAmbiguous
        ? Array.from(set).filter((char) => !AMBIGUOUS.has(char)).join("")
        : set;
      if (filtered) chars.push(filtered[randomIndex(filtered.length)]!);
    }
    while (chars.length < length) chars.push(pool[randomIndex(pool.length)]!);
    setPassword(shuffle(chars).slice(0, length).join(""));
  }, [length, noAmbiguous, pool, selected]);

  useEffect(() => {
    generate();
  }, [generate]);

  const strength = entropy >= 100 ? "Very strong" : entropy >= 75 ? "Strong" : entropy >= 50 ? "Reasonable" : "Weak";
  const strengthTone = entropy >= 75 ? "ok-text" : entropy >= 50 ? "warning-text" : "error-text";

  return (
    <div className="tool-panel">
      <div className="output" style={{ fontSize: 18, letterSpacing: "0.02em", minHeight: 60 }}>
        {password || <span className="micro">Select at least one character set.</span>}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" onClick={generate} disabled={!pool}>
          Generate new
        </button>
        <CopyButton value={password} label="Copy password" />
        <span className={`${strengthTone} micro`} style={{ alignSelf: "center" }} aria-live="polite">
          {pool ? `${strength} · ${entropy} bits of entropy` : "No character sets selected"}
        </span>
      </div>

      <div className="row-wrap" style={{ marginTop: 20 }}>
        <div className="field grow">
          <label htmlFor="pw-length">Length — {length} characters</label>
          <input
            id="pw-length"
            type="range"
            min="8"
            max="128"
            step="1"
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            style={{ width: "100%", accentColor: "var(--wt-color-accent)" }}
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 8 }}>
        {[
          { id: "lower", label: "Lowercase (a–z)", checked: lower, set: setLower },
          { id: "upper", label: "Uppercase (A–Z)", checked: upper, set: setUpper },
          { id: "numbers", label: "Numbers (0–9)", checked: numbers, set: setNumbers },
          { id: "symbols", label: "Symbols (!@#$…)", checked: symbols, set: setSymbols },
        ].map((option) => (
          <label key={option.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, paddingBlock: 4 }}>
            <input
              type="checkbox"
              checked={option.checked}
              onChange={(event) => option.set(event.target.checked)}
            />
            {option.label}
          </label>
        ))}
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, paddingBlock: 4 }}>
          <input type="checkbox" checked={noAmbiguous} onChange={(event) => setNoAmbiguous(event.target.checked)} />
          Exclude ambiguous (0 O 1 l I |)
        </label>
      </div>

      <div className="callout" style={{ marginTop: 18 }}>
        <strong>Generated with crypto.getRandomValues.</strong> Entropy assumes the password is random and used once
        — a 20-character password reused across sites is still a liability. Store it in a password manager.
      </div>
    </div>
  );
}
