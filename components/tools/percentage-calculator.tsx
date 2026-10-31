"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatNumber } from "@/lib/units/registry";
import { useToolView } from "./useToolView";

const modes = [
  {
    id: "of",
    label: "X% of Y",
    question: "What is 15% of 240?",
  },
  {
    id: "is",
    label: "X is what % of Y",
    question: "48 is what percent of 240?",
  },
  {
    id: "change",
    label: "% change",
    question: "From 240 to 300 is a 25% increase.",
  },
  {
    id: "adjust",
    label: "Increase / decrease",
    question: "240 increased by 15% is 276.",
  },
  {
    id: "discount",
    label: "Discount",
    question: "80 less 20% is 64.",
  },
  {
    id: "markup",
    label: "Markup",
    question: "80 marked up by 20% is 96.",
  },
] as const;

type Mode = (typeof modes)[number]["id"];

export default function PercentageCalculator() {
  const { view } = useToolView("percentage-calculator");
  const mode = view as Mode;
  const [a, setA] = useState("15");
  const [b, setB] = useState("240");

  const x = Number(a.trim());
  const y = Number(b.trim());
  const valid = a.trim() !== "" && b.trim() !== "" && Number.isFinite(x) && Number.isFinite(y);

  const computed = useMemo(() => {
    if (!valid) return null;
    switch (mode) {
      case "of":
        return { result: (x / 100) * y, working: `${x}% × ${y} = ${(x / 100) * y}` };
      case "is":
        return y === 0
          ? null
          : { result: (x / y) * 100, working: `${x} ÷ ${y} × 100` };
      case "change":
        return y === 0
          ? null
          : { result: ((x - y) / Math.abs(y)) * 100, working: `(${x} − ${y}) ÷ |${y}| × 100` };
      case "adjust":
        return { result: y * (1 + x / 100), working: `${y} × (1 + ${x}/100)` };
      case "discount":
        return { result: y * (1 - x / 100), working: `${y} × (1 − ${x}/100)` };
      case "markup":
        return { result: y * (1 + x / 100), working: `${y} × (1 + ${x}/100)` };
    }
  }, [mode, valid, x, y]);

  const labels: Record<Mode, [string, string]> = {
    of: ["Percentage", "Of value"],
    is: ["Part", "Whole"],
    change: ["New value", "Original value"],
    adjust: ["Change %", "Starting value"],
    discount: ["Discount %", "Original price"],
    markup: ["Markup %", "Cost"],
  };

  const resultLabel: Record<Mode, string> = {
    of: "Result",
    is: "Percent",
    change: "Change",
    adjust: "Result",
    discount: "Final price",
    markup: "Selling price",
  };

  const suffix: Record<Mode, string> = {
    of: "",
    is: "%",
    change: "%",
    adjust: "",
    discount: "",
    markup: "",
  };

  return (
    <div className="tool-panel">
      <p className="micro" style={{ marginBottom: 16 }}>
        {modes.find((entry) => entry.id === mode)?.question}
      </p>

      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="pct-a">{labels[mode][0]}</label>
          <input
            id="pct-a"
            className="input"
            type="number"
            inputMode="decimal"
            step="any"
            value={a}
            onChange={(event) => setA(event.target.value)}
          />
        </div>
        <div className="field grow">
          <label htmlFor="pct-b">{labels[mode][1]}</label>
          <input
            id="pct-b"
            className="input"
            type="number"
            inputMode="decimal"
            step="any"
            value={b}
            onChange={(event) => setB(event.target.value)}
          />
        </div>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">
            {computed === null ? "—" : formatNumber(computed.result)}
            <span className="readout-unit">{computed === null ? "" : suffix[mode]}</span>
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {resultLabel[mode]}
          </div>
        </div>
        <div className="readout-formula">{computed ? computed.working : "Enter two numbers"}</div>
      </div>

      {mode === "change" && computed ? (
        <p className={computed.result > 0 ? "ok-text" : computed.result < 0 ? "error-text" : "micro"} style={{ marginTop: 12 }}>
          {computed.result > 0 ? "Increase" : computed.result < 0 ? "Decrease" : "No change"} of{" "}
          {formatNumber(Math.abs(computed.result), 4)}%.
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton
          value={computed === null ? "" : `${computed.result}${suffix[mode]}`}
          label="Copy result"
        />
        <CopyButton value={computed?.working ?? ""} label="Copy working" />
      </div>
    </div>
  );
}
