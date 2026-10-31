"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { loan } from "@/lib/tools/finance";

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);

function downloadCsv(rows: ReturnType<typeof loan>) {
  if (!rows) return;
  const lines = [
    "month,payment,interest,principal,balance",
    ...rows.schedule.map((row) =>
      [row.month, row.payment, row.interest, row.principal, row.balance].join(","),
    ),
  ];
  const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "loan-schedule.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("20000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("5");

  const result = useMemo(
    () => loan(Number(principal), Number(rate), Number(years)),
    [principal, rate, years],
  );

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="loan-principal">Amount borrowed</label>
          <input
            id="loan-principal"
            className="input"
            type="number"
            inputMode="decimal"
            min="1"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
          />
        </div>
        <div className="field grow">
          <label htmlFor="loan-rate">Annual rate (%)</label>
          <input
            id="loan-rate"
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </div>
        <div className="field grow">
          <label htmlFor="loan-years">Term (years)</label>
          <input
            id="loan-years"
            className="input"
            type="number"
            inputMode="decimal"
            min="0.25"
            max="50"
            step="0.25"
            value={years}
            onChange={(event) => setYears(event.target.value)}
          />
        </div>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">{result ? money(result.payment) : "—"}</span>
          <div className="micro" style={{ marginTop: 6 }}>
            {result ? `per month · ${result.months} payments` : "enter an amount, rate and term"}
          </div>
        </div>
        <div className="readout-formula">
          P × r ÷ (1 − (1 + r)^−n)
          <br />
          {result ? `${money(result.totalInterest)} total interest` : "—"}
        </div>
      </div>

      {result ? (
        <>
          <dl className="kv" style={{ marginTop: 18 }}>
            <dt>Total repaid</dt>
            <dd>{money(result.totalPaid)}</dd>
            <dt>Total interest</dt>
            <dd>{money(result.totalInterest)}</dd>
            <dt>Interest as share of total</dt>
            <dd>{((result.totalInterest / result.totalPaid) * 100).toFixed(1)}%</dd>
          </dl>

          <div className="table-wrap" style={{ marginTop: 18 }}>
            <table>
              <caption>First 12 payments</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Interest</th>
                  <th scope="col">Principal</th>
                  <th scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(0, 12).map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{money(row.payment)}</td>
                    <td>{money(row.interest)}</td>
                    <td>{money(row.principal)}</td>
                    <td>{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <CopyButton
              value={`${money(result.payment)} per month · ${money(result.totalInterest)} total interest`}
              label="Copy result"
            />
            <button type="button" className="btn btn-sm" onClick={() => downloadCsv(result)}>
              Download schedule (CSV)
            </button>
          </div>
        </>
      ) : null}

      <p className="micro" style={{ marginTop: 14 }}>
        Fixed rate, fully amortising, payments at the end of each month. Fees, insurance, variable rates and
        overpayments are not modelled; this is an estimate, not a lender offer.
      </p>
    </div>
  );
}
