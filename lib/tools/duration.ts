export interface DurationParts {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ParsedDuration {
  parts: DurationParts;
  /** Total under the 365-day year / 30-day month convention. */
  seconds: number;
  error: string | null;
}

const EMPTY: DurationParts = { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

/**
 * Parse an ISO 8601 duration. Calendar units are given fixed lengths for a
 * numeric total and the caller labels that convention; this is not a date sum.
 */
export function parseIsoDuration(input: string): ParsedDuration {
  const value = input.trim().toUpperCase();
  if (!value) return { parts: EMPTY, seconds: 0, error: null };
  if (!value.startsWith("P")) {
    return { parts: EMPTY, seconds: 0, error: "An ISO 8601 duration starts with P, for example PT1H30M." };
  }

  const match = /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
    value,
  );
  if (!match) {
    return {
      parts: EMPTY,
      seconds: 0,
      error: "Unrecognised duration. Use units in order: P years M weeks? days T hours minutes seconds.",
    };
  }
  if (value.endsWith("T")) {
    return { parts: EMPTY, seconds: 0, error: "T must be followed by at least one time component." };
  }

  const number = (index: number) => Number(match[index] ?? 0);
  const parts: DurationParts = {
    years: number(1),
    months: number(2),
    weeks: number(3),
    days: number(4),
    hours: number(5),
    minutes: number(6),
    seconds: number(7),
  };

  const total =
    parts.years * 31_536_000 +
    parts.months * 2_592_000 +
    parts.weeks * 604_800 +
    parts.days * 86_400 +
    parts.hours * 3_600 +
    parts.minutes * 60 +
    parts.seconds;

  if (total === 0 && !/\d/.test(value)) {
    return { parts: EMPTY, seconds: 0, error: "P on its own is not a duration; name at least one unit, such as PT0S." };
  }

  return { parts, seconds: total, error: null };
}

/** Build an ISO 8601 duration from whole seconds. */
export function durationFromSeconds(total: number): string {
  if (!Number.isFinite(total) || total < 0) return "";
  let rest = Math.floor(total);
  const days = Math.floor(rest / 86_400);
  rest -= days * 86_400;
  const hours = Math.floor(rest / 3_600);
  rest -= hours * 3_600;
  const minutes = Math.floor(rest / 60);
  const seconds = rest - minutes * 60;

  let out = "P";
  if (days) out += `${days}D`;
  if (hours || minutes || seconds) {
    out += "T";
    if (hours) out += `${hours}H`;
    if (minutes) out += `${minutes}M`;
    if (seconds) out += `${seconds}S`;
  }
  return out === "P" ? "PT0S" : out;
}
