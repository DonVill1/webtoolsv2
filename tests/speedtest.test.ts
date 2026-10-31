import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/speedtest/route";
import {
  SPEEDTEST,
  SpeedtestHttpError,
  SpeedtestResultError,
  describeSpeedtestError,
  mbpsFromBytes,
  summariseLatency,
} from "@/lib/network/speedtest";

describe("throughput maths", () => {
  it("converts bytes and seconds to decimal megabits", () => {
    expect(mbpsFromBytes(4_000_000, 1)).toBe(32);
    expect(mbpsFromBytes(1_000_000, 0.5)).toBe(16);
    expect(mbpsFromBytes(750_000, 2)).toBe(3);
  });

  it("refuses values that would produce a meaningless figure", () => {
    expect(mbpsFromBytes(0, 1)).toBeNull();
    expect(mbpsFromBytes(1, 0)).toBeNull();
    expect(mbpsFromBytes(-1, 1)).toBeNull();
    expect(mbpsFromBytes(1, -1)).toBeNull();
    expect(mbpsFromBytes(Number.NaN, 1)).toBeNull();
    expect(mbpsFromBytes(1, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("latency summary", () => {
  it("takes the median and the mean change between consecutive pings", () => {
    expect(summariseLatency([20, 30, 25, 100, 22])).toEqual({ medianMs: 25, jitterMs: 42 });
  });

  it("averages the two middle samples for an even count", () => {
    expect(summariseLatency([10, 20, 30, 40])).toEqual({ medianMs: 25, jitterMs: 10 });
  });

  it("ignores unusable samples and handles a single ping", () => {
    expect(summariseLatency([10, Number.NaN, -5, 20])).toEqual({ medianMs: 15, jitterMs: 10 });
    expect(summariseLatency([15])).toEqual({ medianMs: 15, jitterMs: 0 });
    expect(summariseLatency([])).toBeNull();
    expect(summariseLatency([Number.NaN, -2])).toBeNull();
  });
});

describe("speed-test errors", () => {
  it("reports an offline browser before blaming the endpoint", () => {
    const message = describeSpeedtestError(new SpeedtestHttpError(503), false);
    expect(message).toContain("no connection");
  });

  it("names the status the endpoint answered with", () => {
    expect(describeSpeedtestError(new SpeedtestHttpError(503), true)).toContain("503");
    expect(describeSpeedtestError(new SpeedtestHttpError(413), true)).toContain("413");
  });

  it("explains an aborted transfer in seconds", () => {
    const timeout = new DOMException("timed out", "TimeoutError");
    expect(describeSpeedtestError(timeout, true)).toContain(
      `${Math.round(SPEEDTEST.requestTimeoutMs / 1000)} seconds`,
    );
  });

  it("passes a usable-run explanation through unchanged", () => {
    const message = "The upload endpoint did not confirm any bytes.";
    expect(describeSpeedtestError(new SpeedtestResultError(message), true)).toBe(message);
  });
});

describe("speed-test route", () => {
  const origin = "http://localhost/api/speedtest";

  it("serves exactly the requested payload", async () => {
    const response = await GET(new Request(`${origin}?bytes=1000`));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-length")).toBe("1000");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect((await response.arrayBuffer()).byteLength).toBe(1000);
  });

  it("clamps oversized, malformed and negative sizes", async () => {
    const oversized = await GET(new Request(`${origin}?bytes=99999999`));
    expect((await oversized.arrayBuffer()).byteLength).toBe(SPEEDTEST.maxDownloadBytes);

    const malformed = await GET(new Request(`${origin}?bytes=12abc`));
    expect((await malformed.arrayBuffer()).byteLength).toBe(500_000);

    const missing = await GET(new Request(origin));
    expect((await missing.arrayBuffer()).byteLength).toBe(500_000);

    const negative = await GET(new Request(`${origin}?bytes=-5`));
    expect((await negative.arrayBuffer()).byteLength).toBe(0);
  });

  it("confirms the number of bytes it received", async () => {
    const payload = new Uint8Array(SPEEDTEST.uploadBytes);
    const response = await POST(
      new Request(origin, { method: "POST", body: payload }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ bytes: SPEEDTEST.uploadBytes });
  });

  it("refuses a body above the cap without buffering it", async () => {
    const payload = new Uint8Array(SPEEDTEST.maxUploadBytes + 1);
    const response = await POST(
      new Request(origin, { method: "POST", body: payload }),
    );
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: `Payload exceeds ${SPEEDTEST.maxUploadBytes} bytes`,
    });
  });
});
