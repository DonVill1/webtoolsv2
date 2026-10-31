"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

function relative(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
    ["second", 1000],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (abs >= size || unit === "second") return formatter.format(Math.round(diff / size), unit);
  }
  return "now";
}

export default function TimestampConverter() {
  const [now, setNow] = useState<number | null>(null);
  const [unit, setUnit] = useState<"s" | "ms">("s");
  const [stamp, setStamp] = useState("");
  const [localInput, setLocalInput] = useState("");

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const numeric = Number(stamp.trim());
  const validStamp = stamp.trim() !== "" && Number.isFinite(numeric);
  const millis = validStamp ? (unit === "s" ? numeric * 1000 : numeric) : null;
  const date = millis === null ? null : new Date(millis);
  const validDate = date !== null && !Number.isNaN(date.getTime());
  const localDate = localInput ? new Date(localInput) : null;
  const validLocal = localDate !== null && !Number.isNaN(localDate.getTime());

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <p className="micro" style={{ alignSelf: "end" }}>
          Current Unix time
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 22, fontVariantNumeric: "tabular-nums" }}>
            {now === null ? "—" : Math.floor(now / 1000)}
          </span>
          <CopyButton value={now === null ? "" : String(Math.floor(now / 1000))} label="Copy" />
        </div>
        <span className="micro">{now === null ? "reading clock…" : new Date(now).toISOString()}</span>
      </div>

      <div className="row-wrap">
        <div className="field" style={{ width: 150 }}>
          <label htmlFor="ts-unit">Input unit</label>
          <select id="ts-unit" className="select" value={unit} onChange={(event) => setUnit(event.target.value as "s" | "ms")}>
            <option value="s">Seconds</option>
            <option value="ms">Milliseconds</option>
          </select>
        </div>
        <div className="field grow">
          <label htmlFor="ts-input">Unix timestamp</label>
          <input
            id="ts-input"
            className="input"
            inputMode="numeric"
            value={stamp}
            onChange={(event) => setStamp(event.target.value)}
            placeholder={unit === "s" ? "1761600000" : "1761600000000"}
          />
        </div>
        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          onClick={() => {
            setUnit("s");
            setStamp(String(Math.floor(Date.now() / 1000)));
          }}
        >
          Use now
        </button>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value" style={{ fontSize: "calc(var(--nexus-type-xl) * 0.72)" }}>
            {validDate ? date.toISOString() : "—"}
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {validDate ? relative(date.getTime()) : "Enter a timestamp to convert"}
          </div>
        </div>
        <div className="readout-formula">
          seconds since 1970-01-01T00:00:00Z
          <br />
          no leap-second adjustment
        </div>
      </div>

      {validDate ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          <dt>Unix seconds</dt>
          <dd>{Math.floor(date.getTime() / 1000)}</dd>
          <dt>Unix milliseconds</dt>
          <dd>{date.getTime()}</dd>
          <dt>ISO 8601 (UTC)</dt>
          <dd>{date.toISOString()}</dd>
          <dt>UTC string</dt>
          <dd>{date.toUTCString()}</dd>
          <dt>Your local time</dt>
          <dd>{date.toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" })}</dd>
          <dt>UTC offset</dt>
          <dd>
            {Intl.DateTimeFormat("en-US", { timeZoneName: "longOffset" })
              .formatToParts(date)
              .find((part) => part.type === "timeZoneName")?.value ?? "—"}
          </dd>
        </dl>
      ) : null}

      <div className="section-head" style={{ marginTop: 22 }}>
        <h3 className="micro">Date to timestamp</h3>
      </div>
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="ts-local">Local date and time</label>
          <input
            id="ts-local"
            className="input"
            type="datetime-local"
            step="1"
            value={localInput}
            onChange={(event) => setLocalInput(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          disabled={!validLocal}
          onClick={() => {
            if (!validLocal) return;
            setUnit("s");
            setStamp(String(Math.floor(localDate.getTime() / 1000)));
          }}
        >
          Use as input
        </button>
      </div>
      {validLocal ? (
        <dl className="kv" style={{ marginTop: 12 }}>
          <dt>Unix seconds</dt>
          <dd className="mono">{Math.floor(localDate.getTime() / 1000)}</dd>
          <dt>Unix milliseconds</dt>
          <dd className="mono">{localDate.getTime()}</dd>
          <dt>ISO 8601 (UTC)</dt>
          <dd className="mono">{localDate.toISOString()}</dd>
        </dl>
      ) : localInput ? (
        <p className="error-text">That date and time could not be read.</p>
      ) : null}

      <div className="callout" style={{ marginTop: 18 }}>
        <strong>Unix time ignores leap seconds.</strong> It counts 86,400 seconds per day, so it is not a count of
        SI seconds elapsed since 1970.
      </div>
    </div>
  );
}
