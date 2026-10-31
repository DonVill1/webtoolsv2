"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { tip } from "@/lib/tools/finance";

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);

export default function TipCalculator() {
  const [bill, setBill] = useState("80");
  const [rate, setRate] = useState("20");
  const [people, setPeople] = useState("4");
  const [roundUp, setRoundUp] = useState(false);

  const result = useMemo(() => tip(Number(bill), Number(rate), Number(people), roundUp), [bill, rate, people, roundUp]);

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="tip-bill">Bill</label>
          <input
            id="tip-bill"
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={bill}
            onChange={(event) => setBill(event.target.value)}
          />
        </div>
        <div className="field grow">
          <label htmlFor="tip-rate">Tip (%)</label>
          <input
            id="tip-rate"
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.5"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </div>
        <div className="field grow">
          <label htmlFor="tip-people">People</label>
          <input
            id="tip-people"
            className="input"
            type="number"
            inputMode="numeric"
            min="1"
            max="100"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
          />
        </div>
      </div>

      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontSize: 13 }}>
        <input type="checkbox" checked={roundUp} onChange={(event) => setRoundUp(event.target.checked)} />
        Round the total up to the next whole unit
      </label>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">{result ? money(result.perPerson) : "—"}</span>
          <div className="micro" style={{ marginTop: 6 }}>
            {result ? `per person · ${result.people} ${result.people === 1 ? "person" : "people"}` : "enter a bill, tip and headcount"}
          </div>
        </div>
        <div className="readout-formula">
          {result ? `total ${money(result.total)}` : "—"}
          <br />
          {result ? `tip ${money(result.tip)}` : "—"}
        </div>
      </div>

      {result ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          <dt>Bill</dt>
          <dd>{money(Number(bill))}</dd>
          <dt>Tip</dt>
          <dd>{money(result.tip)}</dd>
          {roundUp ? (
            <>
              <dt>Round-up extra</dt>
              <dd>{money(result.extra)}</dd>
            </>
          ) : null}
          <dt>Total</dt>
          <dd>{money(result.total)}</dd>
          <dt>Per person</dt>
          <dd>{money(result.perPerson)}</dd>
          <dt>Rounded per person</dt>
          <dd>{money(Math.ceil(result.perPerson * 100) / 100)}</dd>
        </dl>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton
          value={result ? `Tip ${money(result.tip)} · Total ${money(result.total)} · ${money(result.perPerson)} each` : ""}
          label="Copy summary"
        />
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Tipping norms differ by country and service. The percentage applies to whatever is in the bill field, so
        enter the subtotal if that is the base you intend. Round-up raises the total before splitting.
      </p>
    </div>
  );
}
