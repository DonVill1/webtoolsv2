export interface CronField {
  raw: string;
  values: number[];
  restricted: boolean;
}

export interface ParsedCron {
  fields: [CronField, CronField, CronField, CronField, CronField];
  valid: boolean;
  error: string | null;
}

const BOUNDS: Array<[number, number, string]> = [
  [0, 59, "minute"],
  [0, 23, "hour"],
  [1, 31, "day of month"],
  [1, 12, "month"],
  [0, 7, "day of week"],
];

function parseField(raw: string, min: number, max: number, label: string): CronField | string {
  const values = new Set<number>();
  const parts = raw.split(",");
  if (!raw.trim()) return `The ${label} field is empty.`;

  for (const part of parts) {
    const [range = "", stepText, extra] = part.split("/");
    if (extra !== undefined) return `The ${label} field has more than one step: ${part}.`;
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) return `The step in ${part} must be a positive whole number.`;

    let start: number;
    let end: number;
    if (range === "*" || range === "?") {
      start = min;
      end = max;
    } else if (range.includes("-")) {
      const [from, to] = range.split("-");
      start = Number(from);
      end = Number(to);
      if (!Number.isInteger(start) || !Number.isInteger(end)) return `${part} is not a numeric range.`;
    } else {
      start = Number(range);
      end = stepText === undefined ? start : max;
      if (!Number.isInteger(start)) return `${part} is not a number, range or wildcard.`;
    }

    if (start < min || start > max || end < min || end > max) {
      return `The ${label} field allows ${min}–${max}; ${part} is outside that.`;
    }
    if (end < start) return `${part} ends before it starts.`;
    for (let value = start; value <= end; value += step) values.add(value);
  }

  if (label === "day of week" && values.has(7)) values.add(0);
  return { raw, values: [...values].sort((a, b) => a - b), restricted: raw !== "*" && raw !== "?" };
}

export function parseCron(input: string): ParsedCron {
  const empty = (error: string): ParsedCron => ({
    fields: [
      { raw: "", values: [], restricted: false },
      { raw: "", values: [], restricted: false },
      { raw: "", values: [], restricted: false },
      { raw: "", values: [], restricted: false },
      { raw: "", values: [], restricted: false },
    ],
    valid: false,
    error,
  });

  const fields = input.trim().split(/\s+/).filter(Boolean);
  if (fields.length !== 5) {
    return empty(`A cron expression has five fields; this has ${fields.length}. Add fields or remove the seconds column.`);
  }

  const parsed: CronField[] = [];
  for (let index = 0; index < 5; index += 1) {
    const [min, max, label] = BOUNDS[index]!;
    const field = parseField(fields[index]!, min, max, label);
    if (typeof field === "string") return empty(field);
    parsed.push(field);
  }

  return { fields: parsed as ParsedCron["fields"], valid: true, error: null };
}

/** True when the timestamp matches, applying cron's day-of-month OR day-of-week rule. */
export function cronMatches(parsed: ParsedCron, date: Date): boolean {
  if (!parsed.valid) return false;
  const [minute, hour, day, month, weekday] = parsed.fields;
  if (!minute.values.includes(date.getMinutes())) return false;
  if (!hour.values.includes(date.getHours())) return false;
  if (!month.values.includes(date.getMonth() + 1)) return false;

  const domMatch = day.values.includes(date.getDate());
  const dowMatch = weekday.values.includes(date.getDay());
  if (day.restricted && weekday.restricted) return domMatch || dowMatch;
  return domMatch && dowMatch;
}

const FIVE_YEARS_OF_MINUTES = 5 * 366 * 24 * 60;

/** Next N runs in the viewer's local time, or none within five years. */
export function nextRuns(parsed: ParsedCron, from: Date, count = 5): Date[] {
  if (!parsed.valid) return [];
  const runs: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  for (let step = 0; step < FIVE_YEARS_OF_MINUTES && runs.length < count; step += 1) {
    if (cronMatches(parsed, cursor)) runs.push(new Date(cursor.getTime()));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return runs;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function list(values: Array<string | number>): string {
  if (values.length === 1) return String(values[0]);
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

/** One English sentence that covers the common shapes of a five-field expression. */
export function explainCron(parsed: ParsedCron): string {
  if (!parsed.valid) return parsed.error ?? "Invalid expression.";
  const [minute, hour, day, month, weekday] = parsed.fields;

  let time: string;
  if (!minute.restricted && !hour.restricted) {
    time = "Every minute";
  } else if (!minute.restricted) {
    time = `Every minute during hours ${list(hour.values)}`;
  } else if (!hour.restricted) {
    time = `Every hour at minute ${list(minute.values)}`;
  } else {
    const clocks = hour.values.flatMap((h) =>
      minute.values.map((m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`),
    );
    time = `At ${clocks.slice(0, 6).join(", ")}${clocks.length > 6 ? ` and ${clocks.length - 6} more` : ""}`;
  }

  let days: string;
  if (!day.restricted && !weekday.restricted) {
    days = "every day";
  } else if (weekday.restricted && !day.restricted) {
    days = `on ${list(weekday.values.map((value) => WEEKDAYS[value] ?? String(value)))}`;
  } else if (day.restricted && !weekday.restricted) {
    days = `on day ${list(day.values)} of the month`;
  } else {
    days = `on day ${list(day.values)} of the month or ${list(
      weekday.values.map((value) => WEEKDAYS[value] ?? String(value)),
    )}`;
  }

  const months = month.restricted ? ` in ${month.values.map((value) => MONTHS[value - 1] ?? value).join(", ")}` : "";
  return `${time}, ${days}${months}.`;
}
