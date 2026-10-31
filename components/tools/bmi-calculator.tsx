"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatNumber } from "@/lib/units/registry";
import { useToolView } from "./useToolView";

type System = "metric" | "imperial";

function categoryFor(bmi: number): { label: string; note: string } {
  if (bmi < 18.5) return { label: "Underweight", note: "Below the WHO reference range of 18.5–24.9." };
  if (bmi < 25) return { label: "Healthy range", note: "Within the WHO reference range of 18.5–24.9." };
  if (bmi < 30) return { label: "Overweight", note: "Above the WHO reference range of 18.5–24.9." };
  return { label: "Obese", note: "Above the WHO obesity threshold of 30." };
}

export default function BmiCalculator() {
  const { view } = useToolView("bmi-calculator");
  const system: System = view === "imperial" ? "imperial" : "metric";
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("72");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("159");

  const heightM = system === "metric" ? Number(cm) / 100 : (Number(feet) * 12 + Number(inches)) * 0.0254;
  const weightKg = system === "metric" ? Number(kg) : Number(pounds) * 0.45359237;

  const valid =
    Number.isFinite(heightM) &&
    Number.isFinite(weightKg) &&
    heightM > 0.5 &&
    heightM < 2.5 &&
    weightKg > 2 &&
    weightKg < 500;

  const bmi = valid ? weightKg / (heightM * heightM) : null;
  const category = bmi === null ? null : categoryFor(bmi);

  const healthy = useMemo(() => {
    if (!valid) return null;
    return {
      low: 18.5 * heightM * heightM,
      high: 24.9 * heightM * heightM,
    };
  }, [heightM, valid]);

  const markerPosition = bmi === null ? 0 : Math.min(100, Math.max(0, ((bmi - 12) / 28) * 100));

  return (
    <div className="tool-panel">
      <p className="micro" style={{ marginBottom: 16 }}>
        Adult screening only — not a diagnosis. The metric and imperial tabs keep their own values.
      </p>

      {system === "metric" ? (
        <div className="row-wrap">
          <div className="field grow">
            <label htmlFor="bmi-cm">Height (cm)</label>
            <input
              id="bmi-cm"
              className="input"
              type="number"
              inputMode="decimal"
              min="50"
              max="250"
              step="0.1"
              value={cm}
              onChange={(event) => setCm(event.target.value)}
            />
          </div>
          <div className="field grow">
            <label htmlFor="bmi-kg">Weight (kg)</label>
            <input
              id="bmi-kg"
              className="input"
              type="number"
              inputMode="decimal"
              min="2"
              max="500"
              step="0.1"
              value={kg}
              onChange={(event) => setKg(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="row-wrap">
          <div className="field grow">
            <label htmlFor="bmi-ft">Height (ft)</label>
            <input
              id="bmi-ft"
              className="input"
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              value={feet}
              onChange={(event) => setFeet(event.target.value)}
            />
          </div>
          <div className="field grow">
            <label htmlFor="bmi-in">Height (in)</label>
            <input
              id="bmi-in"
              className="input"
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              value={inches}
              onChange={(event) => setInches(event.target.value)}
            />
          </div>
          <div className="field grow">
            <label htmlFor="bmi-lb">Weight (lb)</label>
            <input
              id="bmi-lb"
              className="input"
              type="number"
              inputMode="decimal"
              min="5"
              max="1100"
              step="0.1"
              value={pounds}
              onChange={(event) => setPounds(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">{bmi === null ? "—" : formatNumber(bmi, 4)}</span>
          <div className="micro" style={{ marginTop: 6 }}>
            kg/m² · {category?.label ?? "enter a valid height and weight"}
          </div>
        </div>
        <div className="readout-formula">
          BMI = weight (kg) ÷ height² (m²)
          <br />
          {valid ? `${formatNumber(weightKg, 5)} ÷ ${formatNumber(heightM, 3)}²` : "—"}
        </div>
      </div>

      {bmi !== null ? (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              position: "relative",
              height: 8,
              borderRadius: 999,
              background: "linear-gradient(90deg, #6aa5c8 0%, #6aa5c8 23%, #4f8f6a 23%, #4f8f6a 46%, #c29a45 46%, #c29a45 64%, #b4543f 64%, #b4543f 100%)",
            }}
            aria-hidden="true"
          >
            <span
              style={{
                position: "absolute",
                left: `${markerPosition}%`,
                top: -5,
                width: 2,
                height: 18,
                background: "var(--wt-color-ink)",
                transform: "translateX(-1px)",
              }}
            />
          </div>
          <div className="micro" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span>12</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
          <p className={bmi >= 18.5 && bmi < 25 ? "ok-text" : "warning-text"} style={{ marginTop: 10 }}>
            {category?.note}
          </p>
        </div>
      ) : null}

      {healthy ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          <dt>Healthy weight for this height</dt>
          <dd>
            {system === "metric"
              ? `${formatNumber(healthy.low, 4)}–${formatNumber(healthy.high, 4)} kg`
              : `${formatNumber(healthy.low / 0.45359237, 4)}–${formatNumber(healthy.high / 0.45359237, 4)} lb`}
          </dd>
          <dt>Reference range</dt>
          <dd>18.5–24.9 kg/m² (WHO adult classification)</dd>
          <dt>Height used</dt>
          <dd>
            {formatNumber(heightM, 3)} m ({formatNumber(heightM / 0.0254, 4)} in)
          </dd>
        </dl>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <CopyButton
          value={bmi === null ? "" : `BMI ${formatNumber(bmi, 4)} kg/m² — ${category?.label ?? ""}`}
          label="Copy result"
        />
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        BMI does not distinguish muscle from fat, and adult thresholds do not apply to children, pregnancy or
        athletes. Use it as one signal, not a verdict.
      </p>
    </div>
  );
}
