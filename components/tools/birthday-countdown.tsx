"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

function nextBirthday(month: number, day: number, now: Date): Date {
  const year = now.getFullYear();
  const candidate = new Date(year, month, day, 0, 0, 0, 0);
  if (candidate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
    return new Date(year + 1, month, day, 0, 0, 0, 0);
  }
  return candidate;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "today";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}

export default function BirthdayCountdown() {
  const [date, setDate] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const parsed = useMemo(() => {
    if (!date || !now) return null;
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) return null;
    const born = new Date(year, month - 1, day);
    if (Number.isNaN(born.getTime()) || born > now) return null;
    return { born, year, month: month - 1, day };
  }, [date, now]);

  const data = useMemo(() => {
    if (!parsed || !now) return null;
    const next = nextBirthday(parsed.month, parsed.day, now);
    const turning = next.getFullYear() - parsed.year;
    const daysToNext = Math.ceil(
      (new Date(next.getFullYear(), next.getMonth(), next.getDate()).getTime() -
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
        86_400_000,
    );
    const ageMs = now.getTime() - parsed.born.getTime();
    const ageDays = Math.floor(ageMs / 86_400_000);
    const upcoming = Array.from({ length: 5 }, (_, index) => {
      const year = next.getFullYear() + index;
      return { year, date: new Date(year, parsed.month, parsed.day), age: year - parsed.year };
    });
    return { next, turning, daysToNext, ageDays, upcoming };
  }, [parsed, now]);

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="birth-date">Date of birth</label>
          <input
            id="birth-date"
            className="input"
            type="date"
            max={now ? now.toISOString().slice(0, 10) : undefined}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">
            {data ? data.daysToNext : "—"}
            <span className="readout-unit">days</span>
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {data && now
              ? data.daysToNext === 0
                ? `Happy birthday — turning ${data.turning} today.`
                : `Until your ${data.turning}${ordinal(data.turning)} birthday on ${data.next.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
              : "Choose a date to begin"}
          </div>
        </div>
        <div className="readout-formula">
          {data && now ? formatDuration(data.next.getTime() - now.getTime()) : "—"}
          <br />
          counted to the nearest minute
        </div>
      </div>

      {data ? (
        <>
          <dl className="kv" style={{ marginTop: 18 }}>
            <dt>Age today</dt>
            <dd>
              {data.turning - (data.daysToNext === 0 ? 0 : 1)} years · {data.ageDays.toLocaleString("en-US")} days
            </dd>
            <dt>Next birthday</dt>
            <dd>
              {data.next.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </dd>
            <dt>Born on a</dt>
            <dd>{parsed?.born.toLocaleDateString("en-US", { weekday: "long" })}</dd>
            <dt>Total days lived</dt>
            <dd>{data.ageDays.toLocaleString("en-US")}</dd>
          </dl>

          <div className="table-wrap" style={{ marginTop: 20 }}>
            <table className="table">
              <caption>Next five birthdays</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weekday</th>
                  <th className="num">Age</th>
                </tr>
              </thead>
              <tbody>
                {data.upcoming.map((entry) => (
                  <tr key={entry.year}>
                    <td>{entry.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                    <td>{entry.date.toLocaleDateString("en-US", { weekday: "long" })}</td>
                    <td className="num">{entry.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="micro" style={{ marginTop: 14 }}>
            Leap-day birthdays are counted on 1 March in non-leap years. Ages use calendar years, not 365-day blocks.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <CopyButton
              value={`${data.daysToNext} days until my ${data.turning}${ordinal(data.turning)} birthday (${data.next.toISOString().slice(0, 10)})`}
              label="Copy countdown"
            />
            <button type="button" className="btn btn-sm" onClick={() => downloadIcs(data.next)}>
              Add to calendar (.ics)
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function icsDate(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

/** A yearly all-day event; the calendar app owns the reminder. */
function downloadIcs(next: Date) {
  const start = icsDate(next);
  const end = icsDate(new Date(next.getFullYear(), next.getMonth(), next.getDate() + 1));
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Webtools//Birthday countdown//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:birthday-${start}@webtools`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    "RRULE:FREQ=YEARLY",
    "SUMMARY:Birthday",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([`${lines.join("\r\n")}\r\n`], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "birthday.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
