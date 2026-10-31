/**
 * Shared numbers and maths for the speed test.
 *
 * The client, the server route and the page copy all read from here so the
 * payload sizes, the advertised data usage and the measurement rules cannot
 * drift apart.
 */

export const SPEEDTEST = {
  /** First download. Its result is discarded because it pays for connection setup. */
  warmupBytes: 750_000,
  /** The download that is actually reported. */
  downloadBytes: 4_000_000,
  /** Hard cap on a single response body from the route. */
  maxDownloadBytes: 4_000_000,
  /** The payload posted to the route. */
  uploadBytes: 1_000_000,
  /** Bound on a request body, so the public route cannot be used to exhaust memory. */
  maxUploadBytes: 8_000_000,
  /** Sequential small requests used for the latency sample. */
  latencyPings: 5,
  /** A single transfer that runs longer than this is aborted and reported. */
  requestTimeoutMs: 20_000,
} as const;

/**
 * Decimal megabits per second, the unit ISPs advertise.
 * Returns null for degenerate input instead of reporting 0 or Infinity.
 */
export function mbpsFromBytes(bytes: number, seconds: number): number | null {
  if (!Number.isFinite(bytes) || !Number.isFinite(seconds)) return null;
  if (bytes <= 0 || seconds <= 0) return null;
  return (bytes * 8) / seconds / 1_000_000;
}

export interface LatencySummary {
  medianMs: number;
  /** Mean absolute change between consecutive samples, the usual jitter definition. */
  jitterMs: number;
}

/**
 * Median and jitter of the ping sample. The median ignores a single slow
 * handshake; jitter is the average change between consecutive pings, not the
 * range, which one outlier would otherwise dominate.
 */
export function summariseLatency(samples: number[]): LatencySummary | null {
  const usable = samples.filter((value) => Number.isFinite(value) && value >= 0);
  if (usable.length === 0) return null;

  const sorted = [...usable].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const medianMs =
    sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;

  let totalChange = 0;
  for (let index = 1; index < usable.length; index += 1) {
    totalChange += Math.abs(usable[index]! - usable[index - 1]!);
  }
  const jitterMs = usable.length < 2 ? 0 : totalChange / (usable.length - 1);

  return { medianMs, jitterMs };
}

/** An endpoint answered, but not with a successful response. */
export class SpeedtestHttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = "SpeedtestHttpError";
    this.status = status;
  }
}

/** A run finished, but the numbers were unusable. The message is user-facing. */
export class SpeedtestResultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpeedtestResultError";
  }
}

/** Turns a thrown value into something a visitor can act on. */
export function describeSpeedtestError(reason: unknown, online: boolean): string {
  if (!online) {
    return "This browser reports no connection. Reconnect, then run the test again.";
  }

  if (reason instanceof SpeedtestHttpError) {
    return `The test endpoint answered HTTP ${reason.status}. A proxy, hosting limit or server error stopped the transfer.`;
  }

  if (reason instanceof SpeedtestResultError) {
    return reason.message;
  }

  if (reason instanceof Error) {
    if (reason.name === "TimeoutError" || reason.name === "AbortError") {
      return `One transfer took longer than ${Math.round(SPEEDTEST.requestTimeoutMs / 1000)} seconds and was stopped. Try again, or check whether a proxy is buffering the request.`;
    }
  }

  return "The test could not finish. An offline connection, a proxy or a hosting limit can interrupt the transfer.";
}
