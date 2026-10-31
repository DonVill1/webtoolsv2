"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { vat } from "@/lib/tools/finance";

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);

export default function VatCalculator() {
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState("20");
  const [mode, setMode] = useState<"add" | "remove">("add");

  const result = useMemo(() => vat(Number(amount), Number(rate), mode), [amount, rate, mode]);
  const numericRate = Number(rate);
  const factor = Number.isFinite(numericRate) ? 1 + numericRate / 100 : 1;

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="vat-amount">{mode === "add" ? "Net amount" : "Gross amount (VAT included)"}</label>
          <input
            id="vat-amount"
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <div className="field" style={{ width: 140 }}>
          <label htmlFor="vat-rate">VAT rate (%)</label>
          <input
            id="vat-rate"
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className={mode === "add" ? "btn btn-sm btn-primary" : "btn btn-sm"}
          onClick={() => setMode("add")}
        >
          Add VAT to a net price
        </button>
        <button
          type="button"
          className={mode === "remove" ? "btn btn-sm btn-primary" : "btn btn-sm"}
          onClick={() => setMode("remove")}
        >
          Remove VAT from a gross price
        </button>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">{result ? money(mode === "add" ? result.gross : result.net) : "—"}</span>
          <div className="micro" style={{ marginTop: 6 }}>
            {result ? (mode === "add" ? "gross total" : "net before VAT") : "enter a valid amount and rate"}
          </div>
        </div>
        <div className="readout-formula">
          {mode === "add" ? "net × (1 + rate)" : "gross ÷ (1 + rate)"}
          <br />
          {mode === "add" ? `${money(Number(amount) || 0)} × ${factor.toFixed(4)}` : `${money(Number(amount) || 0)} ÷ ${factor.toFixed(4)}`}
        </div>
      </div>

      {result ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          <dt>Net</dt>
          <dd>{money(result.net)}</dd>
          <dt>VAT</dt>
          <dd>{money(result.vat)}</dd>
          <dt>Gross</dt>
          <dd>{money(result.gross)}</dd>
          <dt>Factor used</dt>
          <dd className="mono">{result.factor.toFixed(6)}</dd>
          <dt>Check</dt>
          <dd>
            {mode === "remove"
              ? `${money(result.net)} × ${result.factor.toFixed(4)} = ${money(result.gross)}`
              : `${money(result.gross)} ÷ ${result.factor.toFixed(4)} = ${money(result.net)}`}
          </dd>
        </dl>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton
          value={result ? `Net ${money(result.net)} · VAT ${money(result.vat)} · Gross ${money(result.gross)}` : ""}
          label="Copy breakdown"
        />
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Rates vary by country and by item; this is arithmetic, not tax advice. Removing VAT is division by
        1 + rate, never subtraction of the percentage from the gross. Amounts are rounded to the cent.
      </p>
    </div>
  );
}
