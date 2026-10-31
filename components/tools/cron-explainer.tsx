"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { explainCron, nextRuns, parseCron } from "@/lib/tools/cron";
import { useNow } from "./useNow";

const samples = ["*/5 * * * *", "0 9 * * 1-5", "30 2 1 * *", "0 0 * * 0"];

const FIELD_LABELS = ["Minute", "Hour", "Day of month", "Month", "Day of week"];

export default function CronExplainer() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const parsed = useMemo(() => parseCron(expression), [expression]);
  const summary = explainCron(parsed);
  const now = useNow(60_000);
  const runs = useMemo(
    () => (now > 0 && parsed.valid ? nextRuns(parsed, new Date(now), 5) : []),
    [now, parsed],
  );

  return (
    <div className="tool-panel">
      <label className="field-label" htmlFor="cron-input">
        Cron expression
      </label>
      <div className="row-wrap" style={{ marginTop: 6 }}>
        <div className="field grow">
          <input
            id="cron-input"
            className="input mono"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            spellCheck={false}
            placeholder="0 9 * * 1-5"
          />
        </div>
        <CopyButton value={expression} label="Copy" />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {samples.map((sample) => (
          <button key={sample} type="button" className="tab" onClick={() => setExpression(sample)}>
            <span className="mono">{sample}</span>
          </button>
        ))}
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span style={{ fontSize: "var(--nexus-type-md)", lineHeight: 1.4 }}>
            {parsed.valid ? summary : "Check the expression"}
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {parsed.valid ? "Five fields · local time zone" : parsed.error}
          </div>
        </div>
        <div className="readout-formula">
          minute · hour · day
          <br />
          month · weekday
        </div>
      </div>

      {parsed.valid ? (
        <div className="table-wrap" style={{ marginTop: 18 }}>
          <table>
            <caption>What each field allows</caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Expression</th>
                <th scope="col">Values</th>
              </tr>
            </thead>
            <tbody>
              {parsed.fields.map((field, index) => (
                <tr key={FIELD_LABELS[index]}>
                  <th scope="row">{FIELD_LABELS[index]}</th>
                  <td className="mono">{field.raw}</td>
                  <td>{field.values.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="section-head" style={{ marginTop: 18 }}>
        <h3 className="micro">Next five runs</h3>
      </div>
      <ol style={{ margin: "8px 0 0 18px", padding: 0 }}>
        {runs.length === 0 ? (
          <li className="micro">
            {!parsed.valid ? "Fix the expression to see runs." : now === 0 ? "Calculating the next runs…" : "No run within five years."}
          </li>
        ) : (
          runs.map((run) => (
            <li key={run.toISOString()} style={{ fontVariantNumeric: "tabular-nums" }}>
              {run.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </li>
          ))
        )}
      </ol>

      <p className="micro" style={{ marginTop: 14 }}>
        A five-field expression has no seconds. When both day-of-month and day-of-week are restricted, classic cron
        fires if either matches — the explanation names that case. Times use this device&apos;s zone.
      </p>
    </div>
  );
}
