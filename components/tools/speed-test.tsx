"use client";

import { useCallback, useState } from "react";
import { formatBytes } from "@/lib/format";
import {
  SPEEDTEST,
  SpeedtestHttpError,
  SpeedtestResultError,
  describeSpeedtestError,
  mbpsFromBytes,
  summariseLatency,
} from "@/lib/network/speedtest";

interface Results {
  latency?: number;
  jitter?: number;
  downloadMbps?: number;
  uploadMbps?: number;
  transferred: number;
}

type Phase = "idle" | "latency" | "download" | "upload" | "done";

const phaseLabels: Record<Phase, string> = {
  idle: "Ready",
  latency: "Measuring latency…",
  download: "Measuring download…",
  upload: "Measuring upload…",
  done: "Finished",
};

function cacheBust(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Times a whole request/response pair. The first download is deliberately
 * discarded: it pays for DNS, TCP and TLS, so reporting it would understate
 * the connection. Every request is bounded so a buffering proxy cannot leave
 * the page stuck on "Testing…" forever.
 */
async function timedFetch(
  url: string,
  init: RequestInit = {},
): Promise<{ bytes: number; seconds: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SPEEDTEST.requestTimeoutMs);
  const start = performance.now();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      ...init,
    });
    if (!response.ok) throw new SpeedtestHttpError(response.status);
    const body = await response.arrayBuffer();
    return { bytes: body.byteLength, seconds: (performance.now() - start) / 1000 };
  } finally {
    clearTimeout(timer);
  }
}

function incompressible(size: number): Uint8Array<ArrayBuffer> {
  const payload = new Uint8Array(size);
  // getRandomValues caps each call at 65 536 bytes, so fill in chunks rather
  // than leaving most of the upload as zeroes.
  for (let offset = 0; offset < size; offset += 65_536) {
    crypto.getRandomValues(payload.subarray(offset, Math.min(offset + 65_536, size)));
  }
  return payload;
}

/** Upload has to read the JSON echo, so it cannot reuse timedFetch. */
async function timedUpload(
  url: string,
  body: Uint8Array<ArrayBuffer>,
): Promise<{ confirmed: number; seconds: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SPEEDTEST.requestTimeoutMs);
  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      cache: "no-store",
      headers: { "content-type": "application/octet-stream" },
      signal: controller.signal,
    });
    if (!response.ok) throw new SpeedtestHttpError(response.status);
    const echo = (await response.json()) as { bytes?: unknown };
    const seconds = (performance.now() - start) / 1000;
    const confirmed =
      typeof echo.bytes === "number" && Number.isFinite(echo.bytes) ? echo.bytes : 0;
    return { confirmed, seconds };
  } finally {
    clearTimeout(timer);
  }
}

export default function SpeedTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<Results>({ transferred: 0 });
  const [error, setError] = useState("");

  const running = phase !== "idle" && phase !== "done";

  const run = useCallback(async () => {
    setError("");
    setResults({ transferred: 0 });
    setPhase("latency");

    try {
      let transferred = 0;

      const pings: number[] = [];
      for (let index = 0; index < SPEEDTEST.latencyPings; index += 1) {
        const ping = await timedFetch(`/api/speedtest?bytes=1&t=${cacheBust()}-${index}`);
        pings.push(ping.seconds * 1000);
        transferred += ping.bytes;
      }

      const latency = summariseLatency(pings);
      if (!latency) throw new SpeedtestResultError("The latency sample came back empty.");
      setResults({
        latency: latency.medianMs,
        jitter: latency.jitterMs,
        transferred,
      });

      setPhase("download");
      const warmup = await timedFetch(
        `/api/speedtest?bytes=${SPEEDTEST.warmupBytes}&t=${cacheBust()}`,
      );
      transferred += warmup.bytes;

      const download = await timedFetch(
        `/api/speedtest?bytes=${SPEEDTEST.downloadBytes}&t=${cacheBust()}`,
      );
      transferred += download.bytes;
      const downloadMbps = mbpsFromBytes(download.bytes, download.seconds);
      if (downloadMbps === null) {
        throw new SpeedtestResultError(
          "The download endpoint returned an empty body, so there was nothing to measure.",
        );
      }
      setResults((current) => ({ ...current, downloadMbps, transferred }));

      setPhase("upload");
      const upload = await timedUpload(
        `/api/speedtest?t=${cacheBust()}`,
        incompressible(SPEEDTEST.uploadBytes),
      );
      if (upload.confirmed <= 0) {
        throw new SpeedtestResultError(
          "The upload endpoint did not confirm any bytes, so the upload figure would be meaningless.",
        );
      }
      const uploadMbps = mbpsFromBytes(upload.confirmed, upload.seconds);
      if (uploadMbps === null) {
        throw new SpeedtestResultError(
          "The upload finished too quickly to time, so there is no reliable figure.",
        );
      }
      transferred += upload.confirmed;
      setResults((current) => ({ ...current, uploadMbps, transferred }));

      setPhase("done");
    } catch (reason) {
      setError(describeSpeedtestError(reason, navigator.onLine));
      setPhase("idle");
    }
  }, []);

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between" }}>
        <div>
          <p className="field-label">Current phase</p>
          <p style={{ marginTop: 4 }} aria-live="polite">
            {phaseLabels[phase]}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void run()}
          disabled={running}
        >
          {running ? "Testing…" : phase === "done" ? "Run again" : "Start test"}
        </button>
      </div>

      {error ? (
        <p className="error-text" style={{ marginTop: 12 }}>
          {error}
        </p>
      ) : null}

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="output" style={{ minHeight: 130 }}>
          <span className="field-label">Download</span>
          <div className="readout-value" style={{ marginTop: 8 }}>
            {results.downloadMbps !== undefined ? results.downloadMbps.toFixed(1) : "—"}
            <span className="readout-unit">Mbit/s</span>
          </div>
          <div className="micro" style={{ marginTop: 4 }}>
            {results.downloadMbps !== undefined
              ? `${(results.downloadMbps / 8).toFixed(2)} MB/s on the measured run`
              : "750 kB warm-up, then 4 MB measured"}
          </div>
        </div>
        <div className="output" style={{ minHeight: 130 }}>
          <span className="field-label">Upload</span>
          <div className="readout-value" style={{ marginTop: 8 }}>
            {results.uploadMbps !== undefined ? results.uploadMbps.toFixed(1) : "—"}
            <span className="readout-unit">Mbit/s</span>
          </div>
          <div className="micro" style={{ marginTop: 4 }}>
            {results.uploadMbps !== undefined
              ? `${(results.uploadMbps / 8).toFixed(2)} MB/s, confirmed by the server`
              : "1 MB of random data POSTed to this origin"}
          </div>
        </div>
      </div>

      <dl className="kv" style={{ marginTop: 18 }}>
        <dt>Latency (median)</dt>
        <dd>{results.latency !== undefined ? `${results.latency.toFixed(0)} ms` : "—"}</dd>
        <dt>Jitter (mean change)</dt>
        <dd>{results.jitter !== undefined ? `${results.jitter.toFixed(0)} ms` : "—"}</dd>
        <dt>Data transferred</dt>
        <dd>{results.transferred > 0 ? formatBytes(results.transferred) : "—"}</dd>
        <dt>Endpoint</dt>
        <dd>
          This site&apos;s <code>/api/speedtest</code> route
        </dd>
      </dl>

      <div className="callout" style={{ marginTop: 18 }}>
        <strong>This measures one connection, not your plan.</strong> A single TCP stream under-reports fast
        links, and server load, Wi-Fi and browser limits all show up in the number. The first download is thrown
        away so connection setup is not counted; jitter is the average change between consecutive pings, not the
        highest spike. Use it to compare moments, not to dispute a bill.
      </div>
    </div>
  );
}
