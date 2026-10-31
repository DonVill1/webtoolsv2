"use client";

import { useEffect, useMemo, useState } from "react";

const CITIES: Array<{ id: string; city: string; zone: string }> = [
  { id: "new-york", city: "New York", zone: "America/New_York" },
  { id: "los-angeles", city: "Los Angeles", zone: "America/Los_Angeles" },
  { id: "chicago", city: "Chicago", zone: "America/Chicago" },
  { id: "toronto", city: "Toronto", zone: "America/Toronto" },
  { id: "mexico-city", city: "Mexico City", zone: "America/Mexico_City" },
  { id: "sao-paulo", city: "São Paulo", zone: "America/Sao_Paulo" },
  { id: "london", city: "London", zone: "Europe/London" },
  { id: "lisbon", city: "Lisbon", zone: "Europe/Lisbon" },
  { id: "paris", city: "Paris", zone: "Europe/Paris" },
  { id: "berlin", city: "Berlin", zone: "Europe/Berlin" },
  { id: "madrid", city: "Madrid", zone: "Europe/Madrid" },
  { id: "istanbul", city: "Istanbul", zone: "Europe/Istanbul" },
  { id: "dubai", city: "Dubai", zone: "Asia/Dubai" },
  { id: "mumbai", city: "Mumbai", zone: "Asia/Kolkata" },
  { id: "singapore", city: "Singapore", zone: "Asia/Singapore" },
  { id: "tokyo", city: "Tokyo", zone: "Asia/Tokyo" },
  { id: "seoul", city: "Seoul", zone: "Asia/Seoul" },
  { id: "sydney", city: "Sydney", zone: "Australia/Sydney" },
  { id: "auckland", city: "Auckland", zone: "Pacific/Auckland" },
  { id: "utc", city: "UTC", zone: "UTC" },
];

const DEFAULT_IDS = ["new-york", "london", "tokyo"];

export default function TimezoneBuddy() {
  const [now, setNow] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string[]>(DEFAULT_IDS);
  const [candidate, setCandidate] = useState("berlin");

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const instant = useMemo(() => (now === null ? null : new Date(now + offset * 3_600_000)), [now, offset]);

  const zones = selected
    .map((id) => CITIES.find((city) => city.id === id))
    .filter((city): city is (typeof CITIES)[number] => Boolean(city));

  const rows = instant === null ? [] : zones.map((city) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: city.zone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(instant);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    const hour = Number(get("hour"));
    const working = hour >= 9 && hour < 18;
    const awake = hour >= 7 && hour < 22;
    const weekday = get("weekday");
    const weekend = weekday === "Sat" || weekday === "Sun";
    const offsetLabel =
      new Intl.DateTimeFormat("en-US", { timeZone: city.zone, timeZoneName: "shortOffset" })
        .formatToParts(instant)
        .find((part) => part.type === "timeZoneName")?.value ?? "";
    return { ...city, hour, working: working && !weekend, awake, weekday, date: `${get("month")} ${get("day")}`, time: `${get("hour")}:${get("minute")}`, offsetLabel };
  });

  const workingTogether = rows.filter((row) => row.working).length;

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="field-label">Reference moment</span>
          <p style={{ marginTop: 4 }}>
            {instant === null ? "Reading clock…" : instant.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} your time
          </p>
        </div>
        <div className="field" style={{ width: 200 }}>
          <label htmlFor="tz-offset">Shift — {offset === 0 ? "now" : `${offset > 0 ? "+" : ""}${offset} h`}</label>
          <input
            id="tz-offset"
            type="range"
            min="-12"
            max="48"
            step="1"
            value={offset}
            onChange={(event) => setOffset(Number(event.target.value))}
            style={{ accentColor: "var(--wt-color-accent)" }}
          />
        </div>
        <button type="button" className="btn btn-sm" onClick={() => setOffset(0)}>
          Reset to now
        </button>
      </div>

      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table className="table">
          <thead>
            <tr>
              <th>City</th>
              <th>Local time</th>
              <th>Date</th>
              <th>Offset</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.city}</td>
                <td className="num" style={{ fontSize: 17 }}>{row.time}</td>
                <td>{row.weekday} {row.date}</td>
                <td className="mono">{row.offsetLabel}</td>
                <td>
                  <span className={row.working ? "ok-text" : row.awake ? "warning-text" : "micro"}>
                    {row.working ? "Working hours" : row.awake ? "Awake" : "Night"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="tab"
                    style={{ height: 26 }}
                    onClick={() => setSelected((current) => current.filter((id) => id !== row.id))}
                    aria-label={`Remove ${row.city}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row-wrap" style={{ marginTop: 14 }}>
        <div className="field grow">
          <label htmlFor="tz-add">Add a city</label>
          <select id="tz-add" className="select" value={candidate} onChange={(event) => setCandidate(event.target.value)}>
            {CITIES.filter((city) => !selected.includes(city.id)).map((city) => (
              <option key={city.id} value={city.id}>
                {city.city}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          disabled={selected.includes(candidate)}
          onClick={() => setSelected((current) => [...current, candidate])}
        >
          Add
        </button>
        <button type="button" className="btn" style={{ height: 44 }} onClick={() => setSelected(DEFAULT_IDS)}>
          Reset list
        </button>
      </div>

      <p className={instant === null ? "micro" : workingTogether >= 2 ? "ok-text" : "warning-text"} style={{ marginTop: 16 }}>
        {instant === null
          ? "Reading local time…"
          : workingTogether >= 2
            ? `${workingTogether} cities are inside 09:00–18:00 on a weekday at this moment.`
            : "No two of these cities share weekday working hours at this moment — try shifting the reference time."}
      </p>

      <p className="micro" style={{ marginTop: 10 }}>
        Times come from the browser&apos;s IANA time-zone database, so daylight-saving transitions are handled. A
        city on the list represents its zone, not the whole country.
      </p>
    </div>
  );
}
