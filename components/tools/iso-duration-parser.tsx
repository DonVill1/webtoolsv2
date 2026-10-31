"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { durationFromSeconds, parseIsoDuration } from "@/lib/tools/duration";

const COMPONENTS = [
  ["years", "Years"],
  ["months", "Months"],
  ["weeks", "Weeks"],
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
] as const;

export default function IsoDurationParser() {
  const [input, setInput] = useState("P3Y6M4DT12H30M5S");
  const [seconds, setSeconds] = useState("5400");

  const parsed = parseIsoDuration(input);
  const built = durationFromSeconds(Number(seconds));

  return (
    <div className="tool-panel">
      <label className="field-label" htmlFor="duration-input">
        ISO 8601 duration
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <input
          id="duration-input"
          className="input mono grow"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          placeholder="P3Y6M4DT12H30M5S"
          aria-invalid={Boolean(parsed.error)}
        />
        <CopyButton value={parsed.error ? "" : input} label="Copy" />
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value" style={{ fontSize: "calc(var(--nexus-type-xl) * 0.62)" }}>
            {parsed.error ? "—" : `${parsed.seconds.toLocaleString("en-US")} s`}
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {parsed.error ? parsed.error : "approximate total, under the 365/30 convention"}
          </div>
        </div>
        <div className="readout-formula">
          {parsed.error
            ? "P years months weeks"
            : `${parsed.parts.years}y ${parsed.parts.months}m ${parsed.parts.days}d ${parsed.parts.hours}h ${parsed.parts.minutes}m ${parsed.parts.seconds}s`}
          <br />
          calendar units are not fixed
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table>
          <caption>Each parsed component</caption>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Value</th>
              <th scope="col">Fixed seconds</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.map(([key, label]) => {
              const fixed: Record<string, number> = {
                years: 31_536_000,
                months: 2_592_000,
                weeks: 604_800,
                days: 86_400,
                hours: 3_600,
                minutes: 60,
                seconds: 1,
              };
              return (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  <td>{parsed.parts[key]}</td>
                  <td className="mono">{(parsed.parts[key] * (fixed[key] ?? 0)).toLocaleString("en-US")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="section-head" style={{ marginTop: 20 }}>
        <h3 className="micro">Build a duration from seconds</h3>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        <input
          className="input"
          style={{ width: 180 }}
          type="number"
          inputMode="numeric"
          min="0"
          value={seconds}
          onChange={(event) => setSeconds(event.target.value)}
          aria-label="Seconds to convert into a duration"
        />
        <pre className="output" style={{ flex: 1, minWidth: 160 }} aria-live="polite">
          {built || "—"}
        </pre>
        <CopyButton value={built} label="Copy" />
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        P is the period designator and T separates date from time. M means months before T and minutes after it. A
        numeric total assumes 365-day years and 30-day months; the calendar answer depends on the start date.
      </p>
    </div>
  );
}
